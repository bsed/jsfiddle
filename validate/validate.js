(function (window, document, undefined) {

    var defaults = {
        messages: {
            required: '%s是必填的。',
            matches: ' %s字段与%s字段不匹配。',
            "default": '%s字段仍然设置为默认值，请更改。',
            valid_email: '%s字段必须包含一个有效的电子邮件地址。',
            valid_emails: '%s字段必须包含所有有效的电子邮件地址。',
            min_length: '%s字段必须至少是%s个长度的字符。',
            max_length: '%s字段长度不能超过%s个字符长度。',
            exact_length: '%s字段长度必须是%s个字符长度。',
            greater_than: '%s字段必须包含大于%s个字符长度。',
            less_than: '%s字段必须包含小于%s个字符长度。',
            alpha: '%s字段只能包含字母字符。',
            alpha_numeric: '%s字段只能包含字母数字字符。',
            alpha_dash: '%s字段只能包含字母数字字符、下划线和破折号。',//dashes
            numeric: '%s字段必须包含唯一的数字。',
            integer: '%s字段必须包含一个整数。',
            decimal: '%s字段必须包含一个十进制数。',
            is_natural: '%s字段必须包含正的数字。', //
            is_natural_no_zero: '%s字段必须包含一个大于零的数字。',
            valid_ip: '%s字段必须包含一个有效的IP地址.',
            valid_base64: '%s字段必须包含一个base64字符串.',
            valid_credit_card: '%s字段必须包含有效的信用卡号码.',
            is_file_type: '%s字段必须是%s下的文件类型.',
            valid_url: '%s字段必须包含一个有效的网址.',
            greater_than_date: '%s字段必须包含一个较新的日期。', //
            less_than_date: '%s字段必须包含一个较旧的日期。',
            greater_than_or_equal_date: '%s字段必须包含一个日期是%s或新的。',
            less_than_or_equal_date: '%s字段必须包含一个日期是%s或旧的.'
        },
        callback: function (errors) {

        }
    };

    /*
     * 定义正则表达式
     */
    var ruleRegex = /^(.+?)\[(.+)\]$/,
        numericRegex = /^[0-9]+$/,
        integerRegex = /^\-?[0-9]+$/,
        decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
        emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        alphaRegex = /^[a-z]+$/i,
        alphaNumericRegex = /^[a-z0-9]+$/i,
        alphaDashRegex = /^[a-z0-9_\-]+$/i,
        naturalRegex = /^[0-9]+$/i,
        naturalNoZeroRegex = /^[1-9][0-9]*$/i,
        ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
        base64Regex = /[^a-zA-Z0-9\/\+=]/i,
        numericDashRegex = /^[\d\-\s]+$/,
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        dateRegex = /\d{4}-\d{1,2}-\d{1,2}/;

    /*
     * 暴露校验表单的公共对象
     *
     * @param formNameOrNode - String - 表单的属性名称 (例如. <form name="myForm"></form>) 或 表单元素的节点
     * @param fields - Array - [{
     *     name: 元素的名字 (i.e. <input name="myField" />)
     *     display: '显示的名字'
     *     rules: required|matches[password_confirm]
     * }]
     * @param callback - Function - 表单被校验后的回调
     *     @argument errors - 一系列验证错误
     *     @argument event - javaScript 事件
     */

    var validate = function (formNameOrNode, fields, callback) {
        this.callback = callback || defaults.callback;
        this.errors = [];
        this.fields = {};
        this.form = this._formByNameOrNode(formNameOrNode) || {};
        this.messages = {};
        this.handlers = {};
        this.conditionals = {};

        for (var i = 0, fieldLength = fields.length; i < fieldLength; i++) {
            var field = fields[i];

            // 如果检查不通过，我们需要跳过该字段。
            if ((!field.name && !field.names) || !field.rules) {
                console.warn('form validate: 由于错误配置下列字段将被跳过:');
                console.warn(field);
                console.warn('检查以确保您已正确配置该字段的名称和规则');
                continue;
            }

            /*
             * 构建所有需要验证的信息的数组
             */

            if (field.names) {
                for (var j = 0, fieldNamesLength = field.names.length; j < fieldNamesLength; j++) {
                    this._addField(field, field.names[j]);
                }
            } else {
                this._addField(field, field.name);
            }
        }

        /*
         * 为表单提交附加一个事件回调
         */

        var _onsubmit = this.form.onsubmit;
        this.form.onsubmit = (function (that) {
            return function (evt) {
                try {
                    return that._validateForm(evt) && (_onsubmit === undefined || _onsubmit());
                } catch (e) { }
            };
        })(this);
    },

        attributeValue = function (element, attributeName) {
            var i;

            if ((element.length > 0) && (element[0].type === 'radio' || element[0].type === 'checkbox')) {
                for (i = 0, elementLength = element.length; i < elementLength; i++) {
                    if (element[i].checked) {
                        return element[i][attributeName];
                    }
                }

                return;
            }

            return element[attributeName];
        };

    /*
     * @public
     * 给规则设置一个自定义消息
     */

    validate.prototype.setMessage = function (rule, message) {
        this.messages[rule] = message;
        // 返回当前作用链对象
        return this;
    };

    /*
     * @public
     * 给当前规则注册一个自定义回调 (例如：callback_username_check)
     */

    validate.prototype.registerCallback = function (name, handler) {
        if (name && typeof name === 'string' && handler && typeof handler === 'function') {
            this.handlers[name] = handler;
        }
        // 返回当前作用链对象
        return this;
    };

    /*
     * @public
     * 给当前自定义依赖规则注册一个条件
     */

    validate.prototype.registerConditional = function (name, conditional) {
        if (name && typeof name === 'string' && conditional && typeof conditional === 'function') {
            this.conditionals[name] = conditional;
        }

        // 返回当前作用链对象
        return this;
    };

    /*
     * @private
     * Determines if a form dom node was passed in or just a string representing the form name
     */

    validate.prototype._formByNameOrNode = function (formNameOrNode) {
        return (typeof formNameOrNode === 'object') ? formNameOrNode : document.forms[formNameOrNode];
    };

    /*
     * @private
     * 增加一个文件到字段数组中
     */

    validate.prototype._addField = function (field, nameValue) {
        this.fields[nameValue] = {
            name: nameValue,
            display: field.display || nameValue,
            rules: field.rules,
            depends: field.depends,
            id: null,
            element: null,
            type: null,
            value: null,
            checked: null
        };
    };

    /*
     * @private
     * 在提交表单时进行验证。
     */
    validate.prototype._validateForm = function (evt) {
        this.errors = [];

        for (var key in this.fields) {
            if (this.fields.hasOwnProperty(key)) {
                var field = this.fields[key] || {},
                    element = this.form[field.name];

                if (element && element !== undefined) {
                    field.id = attributeValue(element, 'id');
                    field.element = element;
                    field.type = (element.length > 0) ? element[0].type : element.type;
                    field.value = attributeValue(element, 'value');
                    field.checked = attributeValue(element, 'checked');

                    /*
                     * Run through the rules for each field.
                     * If the field has a depends conditional, only validate the field
                     * if it passes the custom function
                     */

                    if (field.depends && typeof field.depends === "function") {
                        if (field.depends.call(this, field)) {
                            this._validateField(field);
                        }
                    } else if (field.depends && typeof field.depends === "string" && this.conditionals[field.depends]) {
                        if (this.conditionals[field.depends].call(this, field)) {
                            this._validateField(field);
                        }
                    } else {
                        this._validateField(field);
                    }
                }
            }
        }

        if (typeof this.callback === 'function') {
            this.callback(this.errors, evt);
        }

        if (this.errors.length > 0) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            } else if (event) {
                // IE uses the global event variable
                event.returnValue = false;
            }
        }

        return true;
    };

    /*
     * @private
     * 查看字段值，并对给定的规则进行校验
     */

    validate.prototype._validateField = function (field) {
        var i, j,
            rules = field.rules.split('|'),
            indexOfRequired = field.rules.indexOf('required'),
            isEmpty = (!field.value || field.value === '' || field.value === undefined);

        /*
         * 按规定规则，根据需要执行验证方法
         */

        for (i = 0, ruleLength = rules.length; i < ruleLength; i++) {
            var method = rules[i],
                param = null,
                failed = false,
                parts = ruleRegex.exec(method);

            /*
             * 如果这个字段不需要，并且该值是空的，除非它是一个回调，继续到下一个规则。
             * 这确保了一个回调函数将被调用，但将跳过其他规则。
             */

            if (indexOfRequired === -1 && method.indexOf('!callback_') === -1 && isEmpty) {
                continue;
            }

            /*
             * 如果该规则有一个参数 (i.e. matches[param]) 分割出来
             */

            if (parts) {
                method = parts[1];
                param = parts[2];
            }

            if (method.charAt(0) === '!') {
                method = method.substring(1, method.length);
            }

            /*
             * 如果这个hook被定义，运行它来查找任何验证错误
             */
            if (typeof this._hooks[method] === 'function') {
                if (!this._hooks[method].apply(this, [field, param])) {
                    failed = true;
                }
            } else if (method.substring(0, 9) === 'callback_') {
                // 自定义方法。如果它被注册，执行该方法
                method = method.substring(9, method.length);

                if (typeof this.handlers[method] === 'function') {
                    if (this.handlers[method].apply(this, [field.value, param, field]) === false) {
                        failed = true;
                    }
                }
            }

            /*
             * 如果hook失败，向错误数组添加一个消息
             */

            if (failed) {
                // 确保我们对这条规则有对应的消息
                var source = this.messages[field.name + '.' + method] || this.messages[method] || defaults.messages[method],
                    message = 'An error has occurred with the ' + field.display + ' field.';

                if (source) {
                    message = source.replace('%s', field.display);

                    if (param) {
                        message = message.replace('%s', (this.fields[param]) ? this.fields[param].display : param);
                    }
                }

                var existingError;
                for (j = 0; j < this.errors.length; j += 1) {
                    if (field.id === this.errors[j].id) {
                        existingError = this.errors[j];
                    }
                }

                var errorObject = existingError || {
                    id: field.id,
                    display: field.display,
                    element: field.element,
                    name: field.name,
                    message: message,
                    messages: [],
                    rule: method
                };
                errorObject.messages.push(message);
                if (!existingError) this.errors.push(errorObject);
            }
        }
    };

    /**
     * 私有方法 _getValidDate: 转换字符串到日期对象
     * @param date (String) 必须是这种格式 yyyy-mm-dd 或者用关键字: today
     * @returns {Date} returns false 假如日期不可用
     */
    validate.prototype._getValidDate = function (date) {
        if (!date.match('today') && !date.match(dateRegex)) {
            return false;
        }

        var validDate = new Date(),
            validDateArray;

        if (!date.match('today')) {
            validDateArray = date.split('-');
            validDate.setFullYear(validDateArray[0]);
            validDate.setMonth(validDateArray[1] - 1);
            validDate.setDate(validDateArray[2]);
        }
        return validDate;
    };

    /*
     * @private
     * 包含所有检验的钩子
     */

    validate.prototype._hooks = {
        required: function (field) {
            var value = field.value;

            if ((field.type === 'checkbox') || (field.type === 'radio')) {
                return (field.checked === true);
            }

            return (value !== null && value !== '');
        },

        "default": function (field, defaultName) {
            return field.value !== defaultName;
        },

        matches: function (field, matchName) {
            var el = this.form[matchName];

            if (el) {
                return field.value === el.value;
            }

            return false;
        },

        valid_email: function (field) {
            return emailRegex.test(field.value);
        },

        valid_emails: function (field) {
            var result = field.value.split(/\s*,\s*/g);

            for (var i = 0, resultLength = result.length; i < resultLength; i++) {
                if (!emailRegex.test(result[i])) {
                    return false;
                }
            }
            return true;
        },

        min_length: function (field, length) {
            if (!numericRegex.test(length)) {
                return false;
            }
            return (field.value.length >= parseInt(length, 10));
        },

        max_length: function (field, length) {
            if (!numericRegex.test(length)) {
                return false;
            }
            return (field.value.length <= parseInt(length, 10));
        },

        exact_length: function (field, length) {
            if (!numericRegex.test(length)) {
                return false;
            }
            return (field.value.length === parseInt(length, 10));
        },

        greater_than: function (field, param) {
            if (!decimalRegex.test(field.value)) {
                return false;
            }
            return (parseFloat(field.value) > parseFloat(param));
        },

        less_than: function (field, param) {
            if (!decimalRegex.test(field.value)) {
                return false;
            }
            return (parseFloat(field.value) < parseFloat(param));
        },

        alpha: function (field) {
            return (alphaRegex.test(field.value));
        },

        alpha_numeric: function (field) {
            return (alphaNumericRegex.test(field.value));
        },

        alpha_dash: function (field) {
            return (alphaDashRegex.test(field.value));
        },

        numeric: function (field) {
            return (numericRegex.test(field.value));
        },

        integer: function (field) {
            return (integerRegex.test(field.value));
        },

        decimal: function (field) {
            return (decimalRegex.test(field.value));
        },

        is_natural: function (field) {
            return (naturalRegex.test(field.value));
        },

        is_natural_no_zero: function (field) {
            return (naturalNoZeroRegex.test(field.value));
        },

        valid_ip: function (field) {
            return (ipRegex.test(field.value));
        },

        valid_base64: function (field) {
            return (base64Regex.test(field.value));
        },

        valid_url: function (field) {
            return (urlRegex.test(field.value));
        },

        valid_credit_card: function (field) {
            // Luhn Check Code from https://gist.github.com/4075533
            // 只接受数字、破折号或空格
            if (!numericDashRegex.test(field.value))
                return false;

            // LUHN 算法
            var nCheck = 0, nDigit = 0, bEven = false;
            var strippedField = field.value.replace(/\D/g, "");
            for (var n = strippedField.length - 1; n >= 0; n--) {
                var cDigit = strippedField.charAt(n);
                nDigit = parseInt(cDigit, 10);
                if (bEven) {
                    if ((nDigit *= 2) > 9) nDigit -= 9;
                }
                nCheck += nDigit;
                bEven = !bEven;
            }
            return (nCheck % 10) === 0;
        },

        is_file_type: function (field, type) {
            if (field.type !== 'file') {
                return true;
            }
            var ext = field.value.substr((field.value.lastIndexOf('.') + 1)),
                typeArray = type.split(','),
                inArray = false,
                i = 0,
                len = typeArray.length;

            for (i; i < len; i++) {
                if (ext.toUpperCase() == typeArray[i].toUpperCase()) inArray = true;
            }

            return inArray;
        },

        greater_than_date: function (field, date) {
            var enteredDate = this._getValidDate(field.value),
                validDate = this._getValidDate(date);

            if (!validDate || !enteredDate) {
                return false;
            }

            return enteredDate > validDate;
        },

        less_than_date: function (field, date) {
            var enteredDate = this._getValidDate(field.value),
                validDate = this._getValidDate(date);

            if (!validDate || !enteredDate) {
                return false;
            }

            return enteredDate < validDate;
        },

        greater_than_or_equal_date: function (field, date) {
            var enteredDate = this._getValidDate(field.value),
                validDate = this._getValidDate(date);

            if (!validDate || !enteredDate) {
                return false;
            }

            return enteredDate >= validDate;
        },

        less_than_or_equal_date: function (field, date) {
            var enteredDate = this._getValidDate(field.value),
                validDate = this._getValidDate(date);

            if (!validDate || !enteredDate) {
                return false;
            }

            return enteredDate <= validDate;
        }
    };

    window.validate = validate;
})(window, document);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = validate;
}
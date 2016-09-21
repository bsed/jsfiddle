$(document).ready(function() { 
if($.cookie("language")) {
    $('div[name|="lang"]').each(function(index) {
      if ($(this).attr("class") == $.cookie("language")) {
           $(this).show(0);
      }
      else {
           $(this).hide(0);
      }
 });
}
$(".language a").click(function() { 
    $('div[name|="lang"]').each(function(index) {
      if ($(this).attr("class") == $(".language a").attr("name")) {
           $(this).show(0);
      }
      else {
           $(this).hide(0);
      }
 });
$.cookie("language",$('.language a').attr('name'), {expires: 365, path:      '/'});
    return false;
});
});
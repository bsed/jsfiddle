<?php 
    echo move_uploaded_file($_FILES['pic']['tmp_name'],'./upload/' . $_FILES['pic']['name']) ? 'OK':'fail';

/* ----------------- Start Document ----------------- */
(function($){
    "use strict";

    $(document).ready(function(){

    /*----------------------------------------------------*/
    /*  Login and register
    /*----------------------------------------------------*/ 
    
    // Login
    $("#login").click(function () {
        let email = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        if( !(email && password)){
            console.log('Data is not given');
            return;
        }

        $.ajax({
            url: "http://localhost:3001/user/login/",
            type: "POST",
            dataType: "json",
            data: {
                email: email,
                password: password,
            },
            error: function (data) {
                alert('error');
                console.log(data);

            },
            success: function (data) { //callback   
                console.log('login successfull');

                if (typeof (Storage) != undefined) {
                    // Store
                    sessionStorage.setItem('sessionInfo',JSON.stringify(data));
                    window.location.href = "./index.html";
                    // Retrieve
                    // document.getElementById("result").innerHTML = sessionStorage.getItem("token");
                } else {
                    // document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
                }
            }
        });
    });


    // Signup
    $("#register").click(function () {
        let username = document.getElementById("username2").value;
        let email = document.getElementById("email2").value;
        let password = document.getElementById("password1").value;
        let rep_password = document.getElementById('password2').value;
        let selected = document.getElementById('userType').selectedIndex;
        let userType = selected == 0 ? 'applicant' : 'recruiter';
        if( !(email && password && username && rep_password)){
            console.log('Data is not given');
            alert('Enter all the fields');
            return;
        }
        if(password != rep_password){
            alert("Passwords did'nt match!!");
            return;
        }
        $.ajax({
            url: "http://localhost:3001/user/signup/",
            type: "POST",
            dataType: "json",
            data: {
                username :username,
                email: email,
                password: password,
                type: userType,
            },
            error: function (data) {
                alert('error');
                console.log(data);
            },
            success: function (data) { //callback   
                console.log('signup successfull');
            }

        });

    });
    // ------------------ End Document ------------------ //
    });

})(this.jQuery);

  
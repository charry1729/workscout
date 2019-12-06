/* ----------------- Start Document ----------------- */
(function($){
    "use strict";
    var sessionInfo = JSON.parse(sessionStorage.getItem('sessionInfo') || "{}");
    if(sessionInfo['userId']===undefined){
        let dshbd = $('#responsive');
        dshbd.children()[3].style.display = 'none'
    }

    $(document).ready(function(){

    /*----------------------------------------------------*/
    /*  Checking if user is alreaady logged in
    /*----------------------------------------------------*/


    var email = sessionInfo['email'] || '';
    var username = sessionInfo['name'] || '';
    var token = sessionInfo['token'] || '';
    var userId = sessionInfo['userId'] || '';
    var userType = sessionInfo['userType'] || 'applicant';
    if(email!="" || username!=""){
        let nav = document.getElementById('navigation');
        let nameu;
        if(username === ""){
            nameu = email;
        }else{
            nameu = username;
        }
        nameu = nameu.split("@")[0];
        nav.children[1].innerHTML='<li style="margin-top: 5%;margin-right: 10px;">Welcome, '+nameu+'</li><li><button id="logout" class="logout" style="border-radius:5px">Log Out</button></li>';
    }

    $('.logout').click(function(){
            sessionStorage.removeItem('sessionInfo');
            sessionStorage.removeItem('profileInfo');
            window.location="./index.html";
    });

    /*----------------------------------------------------------------*/
    /*  Checking if profile is alreaady saved or else getting profile */
    /*----------------------------------------------------------------*/

    var profileInfo = JSON.parse(sessionStorage.getItem('profileInfo') || false);
    var inpts = $("#profile_name,#profile_number,#profile_mail,#profile_info");
    function updateProfile(){
        var profileInfo = JSON.parse(sessionStorage.getItem('profileInfo') || false);
        if(! profileInfo){
            return;
        }
        if(profileInfo['data']['userId']!=undefined &&  profileInfo['data']['userId']==sessionInfo['userId']){
            if(inpts.length==4){
                inpts[0].value = profileInfo['data']['fullName'] || '';
                inpts[1].value = profileInfo['data']['phoneNumber'] || '';
                inpts[2].value = profileInfo['data']['email'] || '';
                inpts[3].value = profileInfo['data']['aboutMe'] || '';
            }

        }
    }
    updateProfile();

    $("#saveChanges").click(function(){
        if(sessionInfo['token']===undefined){
            alert('Login to update profile');
            return;
        }
        if(inpts.length == 4){
            let fullname = inpts[0].value;
            let phoneNumber = inpts[1].value;
            let email = inpts[2].value;
            let aboutme = inpts[3].value;

            $.ajax({
                url: "http://localhost:3001/profile/",
                type: "POST",
                dataType: "json",
                headers:{
                    Authorization: "Bearer "+ sessionInfo['token'],
                },
                data: {
                    fullName :fullname,
                    email: email,
                    phoneNumber: phoneNumber,
                    aboutMe: aboutme,
                    userid : sessionInfo['userId'],
                },
                error: function (error) {
                    // alert('error');
                    console.log(error);
                },
                success: function (data) { //callback   
                    console.log('profile posted successfull');
                    sessionStorage.setItem('profileInfo', JSON.stringify(data) );
                    alert('Profile Updated');
                }

            });
        }
    })

    if(sessionInfo['userId']!=undefined && !profileInfo){
        console.log("inside");
        $.ajax({
                url: "http://localhost:3001/profile/"+sessionInfo['userId'],
                type: "GET",
                dataType: "json",
                headers:{
                    Authorization: "Bearer "+sessionInfo['token'],
                    // Content-Type: "application/json",
                },
                data: {
                    userid : sessionInfo['userId'],
                },
                error: function (error) {
                    // alert('error');
                    console.log(error);
                },
                success: function (data) { //callback   
                    console.log('profile posted successfull');
                    sessionStorage.setItem('profileInfo', JSON.stringify(data) );
                    // alert('Profile Updated');
                }

            });
    }

    /*-------------------------------------------------------*/
    /*  Getting Jobs and stroing them in session storage
    /*-------------------------------------------------------*/

    var jobsInfo = JSON.parse(localStorage.getItem('jobsInfo')||"{}");
    var jobsContainer = document.getElementsByClassName('listings-container');
    var startIndex = 0;
    const limit = 10;
    var loc = window.location.href;
    String.prototype.capitalize = function() {
        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

    function showJobs(jobs){
        console.log('In showjobs');
        console.log(jobs);
        if(jobsContainer.length != 0){
            jobsContainer[0].innerHTML = '';
            let container = '';
            let currentDate = new Date();
            // let sin = startIndex;
            jobs.forEach(job=>{

                let date = job['createdAt'];
                let type = job['jobType'];
                let diff;
                let isNew = ""
                type = type.toLowerCase();

                if(type=='full time'){
                    type = "full-time";
                }else if(type=="part time"){
                    type = "part-time"
                }else if(type=="internship"){
                    type="internship";
                }else{
                    type="freelance";
                }

                if(date == undefined){
                    date = "Old";
                }else{
                    date = Date.parse(date);
                    date =new Date(date);
                    date = ((currentDate - date) / (1000 * 3600 * 24))+0.49;
                    date = Number(date.toFixed());
                    if(date<3){
                        isNew = 'new';
                    }
                    // date = date.toLocaleDateString();
                    date = String(date)+'d ago';
                    if(date == '0d ago'){
                        date = "recent";
                    }
                }
                container += `
                <a href="job-page-alt.html?`+job['_id']+`" class="listing `+type+`">
                    <div class="listing-logo">
                        <img src="images/job-list-logo-01.png" alt="">
                    </div>
                    <div class="listing-title">
                        <h4>`+job['primaryResponsibilities'].capitalize()+` <span class="listing-type">`+type.capitalize()+`</span></h4>
                        <ul class="listing-icons">
                            <li><i class="ln ln-icon-Management"></i> `+job['companyName']+`</li>
                            <li><i class="ln ln-icon-Map2"></i> `+job['location']+`</li>
                            <li><i class="ln ln-icon-Money-2"></i> ₹`+job['maximumsalary']+` </li>
                            <li><div class="listing-date `+isNew+`">`+date+`</div></li>
                        </ul>
                    </div>
                </a>
                `;

            });
            jobsContainer[0].innerHTML=container;
        }

    }

    function updateJobsinDB(){
        $.ajax({
                url: "http://localhost:3001/jobs/",
                type: "GET",
                dataType: "json",
                error: function (error) {
                    // alert('error');
                    console.log(error);
                },
                success: function (data) { //callback   
                    console.log('Jobs are stored');
                    localStorage.setItem('last_updated',new Date());
                    localStorage.setItem('jobsInfo', JSON.stringify(data) );
                    jobsInfo = data;
                }

            });
    }

    if(jobsInfo['count']===undefined){
        updateJobsinDB();
    }else{
        let last_updated = Date.parse(localStorage.getItem('last_updated') || '01/01/2019');
        let diff = (new Date()) - last_updated;
        console.log( diff/1000 );
        if(diff/1000 > 300){
            updateJobsinDB();
        }
    }

    if(! loc.match('my-account.html')){
     showJobs(jobsInfo['jobs'].slice(startIndex,startIndex+limit));

    }

    function findJobByIdinServer(jobId){
        $.ajax({
                url: "http://localhost:3001/jobs/"+jobId,
                type: "GET",
                dataType: "json",
                error: function (error) {
                    // alert('error');
                    console.log(error);
                },
                success: function (data) { //callback   
                    console.log('Got the job');
                    console.log(data);
                    // if(jobsInfo['jobs']){
                    //     jobsInfo['jobs'] = jobsInfo['jobs'].concat();
                    // }else{

                    // }
                    // localStorage.setItem('last_updated',new Date());
                    // localStorage.setItem('jobsInfo', JSON.stringify(data) );
                    // jobsInfo = data;
                }

            });
    }

    function findJobById(jobId){
        if(jobsInfo['jobs']){
            for(let i=0;i<jobsInfo['jobs'].length;i++){
                if(jobsInfo['jobs'][i]["_id"] == jobId){
                    return jobsInfo['jobs'][i];
                }
            }
            findJobByIdinServer(jobId);
        }
        return null
    }
    
    function searchJobs(keyword,location=null){
        let jobsStored = jobsInfo['jobs'];
        keyword = keyword.toLowerCase();
        location = location.toLowerCase();
        if(jobsStored){
            let jobsFound = [];
            jobsStored.forEach(job=>{
                if(job['location'].toLowerCase().match(location)){
                    if(keyword==""){
                        jobsFound = jobsFound.concat(job);
                        return;
                    }
                    if(job['primaryResponsibilities'].toLowerCase().match(keyword)){
                        jobsFound =jobsFound.concat(job);
                        return
                    }
                    if(job['companyName'].toLowerCase().match(keyword)){
                        jobsFound = jobsFound.concat(job);
                    }
                }
            });
            // console.log("Jobs Found are");
            showJobs(jobsFound.slice(0,10));
            console.log(jobsFound);
        }
    }

    var jobKeyword = document.getElementById('jobKeyword');
    var jobLocation = document.getElementById('jobLocation');
    function getSearchData(){
        if(jobKeyword){
            let data = jobKeyword.value;
            let location = jobLocation.value;
            if(data!="" || location!=""){
                searchJobs(data,location);
            }
        }
    }
    $('#jobSearchButton').click(getSearchData);

    /*----------------------------------------------------*/
    /*  job-page-alt.html page
    /*----------------------------------------------------*/
    function addFullJobDescription(jobId){
        if(jobsInfo['jobs']!=undefined){
            let job = findJobById(jobId);
            if (!job){
                return;
            }
            let type = $("#jobPageh");
            let descriptor = $('#job_description');
            let nameTag =$('#companyName');
            let jobLink = $("#jobLink");
            if(jobLink.length){
                let webLink  = job['Website'] || "#";
                // if(webLink!="#"){
                //     let sc1 = webLink.substr(0,8);
                //     let sc2 = webLink.substr(0,7);

                // }
                jobLink[0].href = webLink;
            }
            if(descriptor.length){
                descriptor[0].innerText = job['description'] || "We are leading company in our field";
            }
            if(nameTag.length){
                nameTag[0].innerText = job['companyName'].capitalize();
            }
            if(type.length){
                let tag = type;
                // type[0].innerText = job['primaryResponsibilities'];
                type = job['jobType'];
                type = type.toLowerCase();

                if(type=='full time'){
                    type = "full-time";
                }else if(type=="part time"){
                    type = "part-time"
                }else if(type=="internship"){
                    type="internship";
                }else{
                    type="freelance";
                }
                // let spanJobType = $("#jobType");
                // spanJobType[0].classList.value = type;
                // spanJobType[0].innerText = type.capitalize();
                // console.log(tag);
                tag[0].innerHTML=(job['primaryResponsibilities']||'').capitalize()+'<span id="jobType" class="'+type+'">'+type.capitalize()+'</span>'

            }
            let company ;
            let lists = $('.container .list-1');
            if(lists.length>1){
                let jobResp = lists[0];
                let jobReq = lists[1];

                let innerJobResp = "<li>"+job['primaryResponsibilities'].capitalize()+"</li><li>We’re looking for associates who enjoy interacting with people and working in a fast-paced environment!</li>";
                let innerJobReq = "<li>Must be available to work required shifts including weekends, evenings and holidays.</li>";
                let requirements = job['requirements'] || "";
                requirements = requirements.split(',')
                requirements.reverse();
                requirements.forEach(req=>{
                    innerJobReq = "<li>"+req+"</li>"+innerJobReq;
                });
                jobResp.innerHTML = innerJobResp;
                jobReq.innerHTML = innerJobReq;
            }


            let jobOverview = $(".job-overview span");
            if(jobOverview.length){
                jobOverview[0].innerText = job['location'].capitalize();
                jobOverview[1].innerText = job['jobType'].capitalize();
                // jobOverview[2].innerText = job[''];
                jobOverview[3].innerText = job['maximumsalary'] || "Best-In Industry";
            }
        }
    }

    if(loc.match('job-page-alt.html')){ //only perform this while in page
        let params=loc.split('?')
        if(params.length>1){
            addFullJobDescription(params[1]);
        }

    }

    /*----------------------------------------------------*/
    /*  Adding Jobs
    /*----------------------------------------------------*/    
    $("#addJobTag").click(function(event){
        event.preventDefault();
        if(!sessionInfo['token']){
            alert('Login to post a job');
            return
        }
        let mail,title,type,location,tags,jobdesc,appUrl,closingDate
        $.ajax({
                url: "http://localhost:3001/jobs/",
                type: "POST",
                dataType: "json",
                headers:{
                    Authorization: "Bearer "+sessionInfo['token'],
                },
                data: {
                    fullName :fullname,
                    email: email,
                    phoneNumber: phoneNumber,
                    aboutMe: aboutme,
                    userid : sessionInfo['userId'],
                },
                error: function (error) {
                    alert('error');
                    console.log(error);
                },
                success: function (data) { //callback   
                    console.log('profile posted successfull');
                    sessionStorage.setItem('profileInfo', JSON.stringify(data) );
                    alert('Profile Updated');
                }
            });
    })


    /*----------------------------------------------------*/
    /*  Navigation
    /*----------------------------------------------------*/
    if($('header').hasClass('full-width')) {
        $('header').attr('data-full', 'yes');
    }  
    if($('header').hasClass('alternative')) {
        $('header').attr('data-alt', 'yes');
    }

    function superFishInit() {
        $('#navigation').superfish({
            delay:       300,                               // one second delay on mouseout
            animation:   {opacity:'show'},   // fade-in and slide-down animation
            speed:       200,                               // animation speed
            speedOut:    50                                 // out animation speed
        });
    }

    function menumobile(){
        var winWidth = $(window).width();
        if( winWidth < 973 ) {
            $('#navigation').removeClass('menu');
            $('#navigation li').removeClass('dropdown');
            $('header').removeClass('full-width');
            $('#navigation').superfish('destroy');
        } else {
            $('#navigation').addClass('menu');
            if($('header').data('full') === "yes" ) {
                 $('header').addClass('full-width');
            }
            superFishInit();
        }
        if( winWidth < 1272 ) {
            $('header').addClass('alternative').removeClass('full-width');
        } else {
            if($('header').data('alt') === "yes" ) {} else {
                $('header').removeClass('alternative');
            }
        }
    }

    $(window).on('load resize', function() {
        menumobile();
    });
    superFishInit();


     /*----------------------------------------------------*/
    /*  Mobile Navigation
    /*----------------------------------------------------*/
        var jPanelMenu = $.jPanelMenu({
          menu: '#responsive',
          animated: false,
          duration: 200,
          keyboardShortcuts: false,
          closeOnContentClick: true
        });


      // desktop devices
        $('.menu-trigger').click(function(){
          var jpm = $(this);

          if( jpm.hasClass('active') )
          {
            jPanelMenu.off();
            jpm.removeClass('active');
          }
          else
          {
            jPanelMenu.on();
            jPanelMenu.open();
            jpm.addClass('active');
          }
          return false;
        });


        // Removes SuperFish Styles
        $('#jPanelMenu-menu').removeClass('sf-menu');
        $('#jPanelMenu-menu li ul').removeAttr('style');


        $(window).resize(function (){
          var winWidth = $(window).width();
          var jpmactive = $('.menu-trigger');
          if(winWidth>990) {
            jPanelMenu.off();
            jpmactive.removeClass('active');
          }
        });


    /*----------------------------------------------------*/
    /*  Stacktable / Responsive Tables Plug-in
    /*----------------------------------------------------*/
    $('.responsive-table').stacktable();
    


    /*----------------------------------------------------*/
    /*  Back to Top
    /*----------------------------------------------------*/
        var pxShow = 400; // height on which the button will show
        var fadeInTime = 400; // how slow / fast you want the button to show
        var fadeOutTime = 400; // how slow / fast you want the button to hide
        var scrollSpeed = 400; // how slow / fast you want the button to scroll to top.

        $(window).scroll(function(){
          if($(window).scrollTop() >= pxShow){
            $("#backtotop").fadeIn(fadeInTime);
          } else {
            $("#backtotop").fadeOut(fadeOutTime);
          }
        });

        $('#backtotop a').click(function(){
          $('html, body').animate({scrollTop:0}, scrollSpeed);
          return false;
        });
    


    /*----------------------------------------------------*/
    /*  Showbiz Carousel
    /*----------------------------------------------------*/
        $('#job-spotlight').showbizpro({
            dragAndScroll:"off",
            visibleElementsArray:[1,1,1,1],
            carousel:"off",
            entrySizeOffset:0,
            allEntryAtOnce:"off",
            rewindFromEnd:"off",
            autoPlay:"off",
            delay:2000,
            speed:400,
            easing:'easeOut'
        });

        $('#our-clients').showbizpro({
            dragAndScroll:"off",
            visibleElementsArray:[5,4,3,1],
            carousel:"off",
            entrySizeOffset:0,
            allEntryAtOnce:"off"
        });



    /*----------------------------------------------------*/
    /*  Slick Carousel
    /*----------------------------------------------------*/
    $('.testimonial-carousel').slick({
      centerMode: true,
      centerPadding: '34%',
      slidesToShow: 1,
      dots: true,
      arrows: false,
      responsive: [
        {
          breakpoint: 1025,
          settings: {
            centerPadding: '10px',
            slidesToShow: 2,
          }
        },
        {
          breakpoint: 767,
          settings: {
            centerPadding: '10px',
            slidesToShow: 1
          }
        }
      ]
    });


    /*----------------------------------------------------*/
    /*  Flip Banner
    /*----------------------------------------------------*/
    function flipBanner() {

        $('.flip-banner').prepend('<div class="flip-banner-overlay"></div>');

        $(".flip-banner").each(function() {
            var attrImage = $(this).attr('data-background');
            var attrColor = $(this).attr('data-color');
            var attrOpacity = $(this).attr('data-color-opacity');

            if(attrImage !== undefined) {
                $(this).css('background-image', 'url('+attrImage+')');
            }

            if(attrColor !== undefined) {
                $(this).find(".flip-banner-overlay").css('background-color', ''+attrColor+'');
            }

            if(attrOpacity !== undefined) {
                $(this).find(".flip-banner-overlay").css('opacity', ''+attrOpacity+'');
            }

        });
    }
    flipBanner();


    /*----------------------------------------------------*/
    /*  Image Box
    /*----------------------------------------------------*/
    $('.img-box').each(function(){
        $(this).append('<div class="img-box-background"></div>');
        $(this).children('.img-box-background').css({'background-image': 'url('+ $(this).attr('data-background-image') +')'});
    });


    /*----------------------------------------------------*/
    /*  Revolution Slider
    /*----------------------------------------------------*/
        $('.fullwidthbanner').revolution({
            delay: 9000,
            startwidth: 1180,
            startheight: 640,
            onHoverStop: "on", // Stop Banner Timet at Hover on Slide on/off
            navigationType: "none", //bullet, none
            navigationArrows: "verticalcentered", //nexttobullets, verticalcentered, none
            navigationStyle: "none", //round, square, navbar, none
            touchenabled: "on", // Enable Swipe Function : on/off
            navOffsetHorizontal: 0,
            navOffsetVertical: 20,
            stopAtSlide: -1, // Stop Timer if Slide "x" has been Reached. If stopAfterLoops set to 0, then it stops already in the first Loop at slide X which defined. -1 means do not stop at any slide. stopAfterLoops has no sinn in this case.
            stopAfterLoops: -1, // Stop Timer if All slides has been played "x" times. IT will stop at THe slide which is defined via stopAtSlide:x, if set to -1 slide never stop automatic
            fullWidth: "on",
        });



    /*----------------------------------------------------*/
    /*  Flexslider
    /*----------------------------------------------------*/
        $('.testimonials-slider').flexslider({
            animation: "fade",
            controlsContainer: $(".custom-controls-container"),
            customDirectionNav: $(".custom-navigation a")
        });



    /*----------------------------------------------------*/
    /*  Counters
    /*----------------------------------------------------*/

        $('.counter').counterUp({
            delay: 10,
            time: 800
        });



    /*----------------------------------------------------*/
    /*  Chosen Plugin
    /*----------------------------------------------------*/

        var config = {
          '.chosen-select'           : {disable_search_threshold: 10, width:"100%"},
          '.chosen-select-deselect'  : {allow_single_deselect:true, width:"100%"},
          '.chosen-select-no-single' : {disable_search_threshold:10, width:"100%"},
          '.chosen-select-no-results': {no_results_text:'Oops, nothing found!'},
          '.chosen-select-width'     : {width:"95%"}
        };
        for (var selector in config) {
          $(selector).chosen(config[selector]);
        }


    /*----------------------------------------------------*/
    /*  Checkboxes "any" fix
    /*----------------------------------------------------*/   
        $('.checkboxes').find('input:first').addClass('first');
        $('.checkboxes input').on('change', function() {
            if($(this).hasClass('first')){
                $(this).parents('.checkboxes').find('input').prop('checked', false);
                $(this).prop('checked', true);
            } else {
                $(this).parents('.checkboxes').find('input:first').not(this).prop('checked', false);
            }
        });


    /*----------------------------------------------------*/
    /*  Magnific Popup
    /*----------------------------------------------------*/   
        
            $('body').magnificPopup({
                type: 'image',
                delegate: 'a.mfp-gallery',

                fixedContentPos: true,
                fixedBgPos: true,

                overflowY: 'auto',

                closeBtnInside: true,
                preloader: true,

                removalDelay: 0,
                mainClass: 'mfp-fade',

                gallery:{enabled:true},

                callbacks: {
                    buildControls: function() {
                        console.log('inside'); this.contentContainer.append(this.arrowLeft.add(this.arrowRight));
                    }
                }
            });


            $('.popup-with-zoom-anim').magnificPopup({
                type: 'inline',

                fixedContentPos: false,
                fixedBgPos: true,

                overflowY: 'auto',

                closeBtnInside: true,
                preloader: false,

                midClick: true,
                removalDelay: 300,
                mainClass: 'my-mfp-zoom-in'
            });


            $('.mfp-image').magnificPopup({
                type: 'image',
                closeOnContentClick: true,
                mainClass: 'mfp-fade',
                image: {
                    verticalFit: true
                }
            });


            $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,

                fixedContentPos: false
            });


     /*---------------------------------------------------*/
    /*  Contact Form
    /*---------------------------------------------------*/
    $("#contactform .submit").click(function(e) {


      e.preventDefault();
      var user_name       = $('input[name=name]').val();
      var user_email      = $('input[name=email]').val();
      var user_comment    = $('textarea[name=comment]').val();

      //simple validation at client's end
      //we simply change border color to red if empty field using .css()
      var proceed = true;
      if(user_name===""){
          $('input[name=name]').addClass('error');
            proceed = false;
          }
          if(user_email===""){
            $('input[name=email]').addClass('error');
            proceed = false;
          }
          if(user_comment==="") {
            $('textarea[name=comment]').addClass('error');
            proceed = false;
          }

          //everything looks good! proceed...
          if(proceed) {
            $('.hide').fadeIn();
            $("#contactform .submit").fadeOut();
              //data to be sent to server
              var post_data = {'userName':user_name, 'userEmail':user_email, 'userComment':user_comment};

              //Ajax post data to server
              $.post('contact.php', post_data, function(response){
                var output;
                //load json data from server and output comment
                if(response.type == 'error')
                  {
                    output = '<div class="error">'+response.text+'</div>';
                    $('.hide').fadeOut();
                    $("#contactform .submit").fadeIn();
                  } else {

                    output = '<div class="success">'+response.text+'</div>';
                    //reset values in all input fields
                    $('#contact div input').val('');
                    $('#contact textarea').val('');
                    $('.hide').fadeOut();
                    $("#contactform .submit").fadeIn().attr("disabled", "disabled").css({'backgroundColor':'#c0c0c0', 'cursor': 'default' });
                  }

                  $("#result").hide().html(output).slideDown();
                }, 'json');
            }
      });

    //reset previously set border colors and hide all comment on .keyup()
    $("#contactform input, #contactform textarea").keyup(function() {
      $("#contactform input, #contactform textarea").removeClass('error');
      $("#result").slideUp();
    });




    /*----------------------------------------------------*/
    /*  Accordions
    /*----------------------------------------------------*/

        var $accor = $('.accordion');

         $accor.each(function() {
            $(this).addClass('ui-accordion ui-widget ui-helper-reset');
            $(this).find('h3').addClass('ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all');
            $(this).find('div').addClass('ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom');
            $(this).find("div").hide().first().show();
            $(this).find("h3").first().removeClass('ui-accordion-header-active ui-state-active ui-corner-top').addClass('ui-accordion-header-active ui-state-active ui-corner-top');
            $(this).find("span").first().addClass('ui-accordion-icon-active');
        });

        var $trigger = $accor.find('h3');

        $trigger.on('click', function(e) {
            var location = $(this).parent();

            if( $(this).next().is(':hidden') ) {
                var $triggerloc = $('h3',location);
                $triggerloc.removeClass('ui-accordion-header-active ui-state-active ui-corner-top').next().slideUp(300);
                $triggerloc.find('span').removeClass('ui-accordion-icon-active');
                $(this).find('span').addClass('ui-accordion-icon-active');
                $(this).addClass('ui-accordion-header-active ui-state-active ui-corner-top').next().slideDown(300);
            }
             e.preventDefault();
        });

    

    /*----------------------------------------------------*/
    /*  Application Tabs
    /*----------------------------------------------------*/   
        // Get all the links.
        var link = $(".app-link");
        $('.close-tab').hide();

        $('.app-tabs div.app-tab-content').hide();
        // On clicking of the links do something.
        link.on('click', function(e) {

            e.preventDefault();
            $(this).parents('div.application').find('.close-tab').fadeOut();
            var a = $(this).attr("href");
            if($(this).hasClass('opened')) {
                $(this).parents('div.application').find(".app-tabs div.app-tab-content").slideUp('fast');
                $(this).parents('div.application').find('.close-tab').fadeOut(10);
                $(this).removeClass('opened');
            } else {
                $(this).parents('div.application').find(".app-link").removeClass('opened');
                $(this).addClass('opened');
                $(this).parents('div.application').find(a).slideDown('fast').removeClass('closed').addClass('opened');
                $(this).parents('div.application').find('.close-tab').fadeIn(10);
            }

            $(this).parents('div.application').find(".app-tabs div.app-tab-content").not(a).slideUp('fast').addClass('closed').removeClass('opened');
            
        });

        $('.close-tab').on('click',function(e){
            $(this).fadeOut();
            e.preventDefault();
            $(this).parents('div.application').find(".app-link").removeClass('opened');
            $(this).parents('div.application').find(".app-tabs div.app-tab-content").slideUp('fast').addClass('closed').removeClass('opened');
        });


    /*----------------------------------------------------*/
    /*  Add Resume 
    /*----------------------------------------------------*/   
        $('.box-to-clone').hide();
        $('.add-box').on('click', function(e) {
            e.preventDefault();
            var newElem = $(this).parent().find('.box-to-clone:first').clone();
            newElem.find('input').val('');
            newElem.prependTo($(this).parent()).show();
            var height = $(this).prev('.box-to-clone').outerHeight(true);
            
            $("html, body").stop().animate({ scrollTop: $(this).offset().top-height}, 600);
        });

        $('body').on('click','.remove-box', function(e) {
            e.preventDefault();
            $(this).parent().remove();
        });



    /*----------------------------------------------------*/
    /*  Tabs
    /*----------------------------------------------------*/ 
  

        var $tabsNav    = $('.tabs-nav'),
        $tabsNavLis = $tabsNav.children('li');
        // $tabContent = $('.tab-content');

        $tabsNav.each(function() {
            var $this = $(this);

            $this.next().children('.tab-content').stop(true,true).hide()
            .first().show();

            $this.children('li').first().addClass('active').stop(true,true).show();
        });

        $tabsNavLis.on('click', function(e) {
            var $this = $(this);

            $this.siblings().removeClass('active').end()
            .addClass('active');

            $this.parent().next().children('.tab-content').stop(true,true).hide()
            .siblings( $this.find('a').attr('href') ).fadeIn();

            e.preventDefault();
        });
          var hash = window.location.hash;
    var anchor = $('.tabs-nav a[href="' + hash + '"]');
    if (anchor.length === 0) {
        $(".tabs-nav li:first").addClass("active").show(); //Activate first tab
        $(".tab-content:first").show(); //Show first tab content
    } else {
        console.log(anchor);
        anchor.parent('li').click();
    }



    /*----------------------------------------------------*/
    /*  Sliding In-Out Content
    /*----------------------------------------------------*/

    $(window).bind("load resize scroll",function(e){
        var headerElem = $('.search-container');

        // flying out and fading for header content
        $(headerElem).css({  'transform': 'translateY(' + (  $(window).scrollTop() / -9 ) + 'px)', });
        // $(headerElem).css({ 'opacity': 1 - $(window).scrollTop() / 600 });  
    });



    /*----------------------------------------------------*/
    /*  Parallax
    /*----------------------------------------------------*/
    /* detect touch */
    if("ontouchstart" in window){
        document.documentElement.className = document.documentElement.className + " touch";
    }
    if(!$("html").hasClass("touch")){
        /* background fix */
        $(".parallax").css("background-attachment", "fixed");
    }

    /* fix vertical when not overflow
    call fullscreenFix() if .fullscreen content changes */
    function fullscreenFix(){
        var h = $('body').height();
        // set .fullscreen height
        $(".parallax-content").each(function(i){
            if($(this).innerHeight() > h){ $(this).closest(".fullscreen").addClass("overflow");
            }
        });
    }
    $(window).resize(fullscreenFix);
    fullscreenFix();



    /* resize background images */
    function backgroundResize(){
        var windowH = $(window).height();
        $(".background").each(function(i){
            var path = $(this);
            // variables
            var contW = path.width();
            var contH = path.height();
            var imgW = path.attr("data-img-width");
            var imgH = path.attr("data-img-height");
            var ratio = imgW / imgH;
            // overflowing difference
            var diff = parseFloat(path.attr("data-diff"));
            diff = diff ? diff : 0;
            // remaining height to have fullscreen image only on parallax
            var remainingH = 0;
            if(path.hasClass("parallax") && !$("html").hasClass("touch")){
                var maxH = contH > windowH ? contH : windowH;
                remainingH = windowH - contH;
            }
            // set img values depending on cont
            imgH = contH + remainingH + diff;
            imgW = imgH * ratio;
            // fix when too large
            if(contW > imgW){
                imgW = contW;
                imgH = imgW / ratio;
            }
            //
            path.data("resized-imgW", imgW);
            path.data("resized-imgH", imgH);
            path.css("background-size", imgW + "px " + imgH + "px");
        });
    }
    $(window).resize(backgroundResize);
    $(window).focus(backgroundResize);
    backgroundResize();



    /* set parallax background-position */
    function parallaxPosition(e){
        var heightWindow = $(window).height();
        var topWindow = $(window).scrollTop();
        var bottomWindow = topWindow + heightWindow;
        var currentWindow = (topWindow + bottomWindow) / 2;
        $(".parallax").each(function(i){
            var path = $(this);
            var height = path.height();
            var top = path.offset().top;
            var bottom = top + height;
            // only when in range
            if(bottomWindow > top && topWindow < bottom){
                var imgW = path.data("resized-imgW");
                var imgH = path.data("resized-imgH");
                // min when image touch top of window
                var min = 0;
                // max when image touch bottom of window
                var max = - imgH + heightWindow;
                // overflow changes parallax
                var overflowH = height < heightWindow ? imgH - height : imgH - heightWindow; // fix height on overflow
                top = top - overflowH;
                bottom = bottom + overflowH;
                // value with linear interpolation
                var value = -100 + min + (max - min) * (currentWindow - top) / (bottom - top);
                // set background-position
                var orizontalPosition = path.attr("data-oriz-pos");
                orizontalPosition = orizontalPosition ? orizontalPosition : "50%";
                $(this).css("background-position", orizontalPosition + " " + value + "px");

            }
        });
    }
    if(!$("html").hasClass("touch")){
        $(window).resize(parallaxPosition);
        //$(window).focus(parallaxPosition);
        $(window).scroll(parallaxPosition);
        parallaxPosition();
    }


    /*----------------------------------------------------*/
    /*  Sticky Header 
    /*----------------------------------------------------*/
    $(".sticky-header").clone(true).addClass('cloned').insertAfter(".sticky-header");
    $(".sticky-header.cloned.transparent #logo a img").attr("src", "images/logo.png");
    $(".sticky-header.cloned.alternative").removeClass('alternative');

    if ( $( ".sticky-header" ).length) { 
        var stickyHeader = document.querySelector(".sticky-header.cloned");

        var headroom = new Headroom(stickyHeader, {
          "offset": $(".sticky-header").height(),
          "tolerance": 0
        });
    }

    // disabling on mobile
    $(window).bind("load resize",function(e){
        $( ".sticky-header.cloned" ).removeClass('transparent alternative');

        var winWidth = $(window).width();

        if(winWidth>1290 && $(".sticky-header").length) {
            headroom.init();
            }

            else if(winWidth<1290 && $(".dashboard-header").length < 0) {
                headroom.destroy();
                $(".sticky-header.cloned").remove();
            }
    });


    /*----------------------------------------------------*/
    /*  Auto Header Padding
    /*----------------------------------------------------*/
    $(window).on('load resize', function() {
        var winWidth = $(window).width();
        if (winWidth>990) {
            var headerHeight = $(".dashboard-header").height();
            $('#dashboard').css('padding-top', headerHeight);
        } else {
            $('#dashboard').css('padding-top','0');
        }

    });

    /*----------------------------------------------------*/
    /* Dashboard Scripts
    /*----------------------------------------------------*/

    // Dashboard Nav Submenus
    $('.dashboard-nav ul li a').on('click', function(e){
        if($(this).closest("li").children("ul").length) {
            if ( $(this).closest("li").is(".active-submenu") ) {
               $('.dashboard-nav ul li').removeClass('active-submenu');
            } else {
                $('.dashboard-nav ul li').removeClass('active-submenu');
                $(this).parent('li').addClass('active-submenu');
            }
            e.preventDefault();
        }
    });

    // Dashbaord Nav Scrolling
    $(window).on('load resize', function() {
        var wrapperHeight = window.innerHeight;
        var headerHeight = $("#header-container").height();
        var winWidth = $(window).width();

        if(winWidth>992) {
            $(".dashboard-nav-inner").css('max-height', wrapperHeight-headerHeight);
        } else {
            $(".dashboard-nav-inner").css('max-height', '');
        }
    });


    // Responsive Nav Trigger
    $('.dashboard-responsive-nav-trigger').on('click', function(e){
        e.preventDefault();
        $(this).toggleClass('active');

        var dashboardNavContainer = $('body').find(".dashboard-nav");

        if( $(this).hasClass('active') ){
            $(dashboardNavContainer).addClass('active');
        } else {
            $(dashboardNavContainer).removeClass('active');
        }

    });




// ------------------ End Document ------------------ //
});

})(this.jQuery);

  
const API_URL = "https://a5rx9suhc3.execute-api.us-east-1.amazonaws.com/dev";
const PHOTOGALLERY_S3_BUCKET_URL = "photobucket-kahinga-ece-4150";

function clearSession() {
    sessionStorage.clear();
    location.href='login.html';
};

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}

function processLogin() {
    var username =  $("#username" ).val();
    var password = $("#password" ).val();

    var datadir = {
        username: username,
        password: password
    };

    $.ajax({
        url: `${API_URL}/login`,
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {
            var result = JSON.parse(data.body);
            console.log(result);
            if(result.result){
                sessionStorage.setItem('username', result.userdata.username);
                sessionStorage.setItem('name', result.userdata.name);
                sessionStorage.setItem('email', result.userdata.email);
                location.href='index.html';
            }else{
                $("#message").html(result.message);
            }
            
            console.log(data);
        },
        error: function(data) {
            console.log(data);
            console.log("Failed");
        },        
        data: JSON.stringify(datadir)
    });    
}


function processSignup() {
    var username =  $("#username" ).val();
    var password = $("#password" ).val();
    var password1 = $("#password1" ).val();
    var name = $("#name" ).val();
    var email = $("#email" ).val();

    var datadir = {
        username: username,
        password: password,
        name: name,
        email: email
    };

    $.ajax({
        url: `${API_URL}/signup`,
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {
            var result = JSON.parse(data.body);
            console.log(result);
            $("#message").html(result.message);
            if(result.result){
                sessionStorage.setItem('username', result.userdata.username);
                $("#messageaction").html("Click  <a href=\"confirmemail.html\">here</a> to confirm your email");
            }
        },
        error: function() {
            console.log("Failed");
        },        
        data: JSON.stringify(datadir)
    });    
}

function loadConfirmEmailPage(){
    var username = $("#username").val();
    var code = $("#code").val();

    var datadir = {
        username: username,
        code: code
    };

    $.ajax({
        url: `${API_URL}/confirmemail`,
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {
            var result = JSON.parse(data.body);
            console.log(result);
            if(result.result){                
                $("#confirmemail-message").html(result.message);
                $("#confirmemail-message-action").html("Click  <a href=\"login.html\">here</a> to login");                
            }else{
                $("#confirmemail-message").html(result.message);
            }
            
            console.log(data);
        },
        error: function(data) {
            console.log(data);
            console.log("Failed");
        },        
        data: JSON.stringify(datadir)
    });  
}


function uploadPhoto(){
    var title = $("#title").val();
    var description = $("#description").val();
    var tags = $("#tags").val();
    var imageFile = $('#imagefile')[0].files[0];
    
    var contenttype = imageFile.type;
    var filename=imageFile.name;
    console.log(imageFile);
    console.log(filename);

    $.ajax({
        url: `${API_URL}/uploadphoto/${filename}`,
        type: 'PUT',
        crossDomain: true,
        contentType: contenttype,
        processData: false,
        statusCode: {
        200: function(data) {
            console.log(data);
            console.log("Uploaded");
            processAddPhoto(filename, title, description, tags);
         }
        },       
        data: imageFile
    }); 
}

function loadSearchPage(){
    var query = sessionStorage.getItem('query') || "";

    if (!query) {
        $("#searchquery-container").html("No search query provided.");
        return;
    }

    var datadir = { query: query };

    $.ajax({
        url: `${API_URL}/search`,
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {
            console.log("Search results: ", data);

            // Handle different response formats
            var results = data.body || data || [];

            $("#searchquery-container").html(`Showing search results for: <strong>${query}</strong>`);

            var htmlstr = "";
            $.each(results, function(index, value) { 
                htmlstr += `
                    <div class="cbp-item idea web-design theme-portfolio-item-v2 theme-portfolio-item-xs">
                        <div class="cbp-caption">
                            <div class="cbp-caption-defaultWrap theme-portfolio-active-wrap">
                                <img src="${value.URL}" alt="">
                                <div class="theme-icons-wrap theme-portfolio-lightbox">
                                    <a class="cbp-lightbox" href="${value.URL}" data-title="Portfolio">
                                        <i class="theme-icons theme-icons-white-bg theme-icons-sm radius-3 icon-focus"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="theme-portfolio-title-heading">
                            <h4 class="theme-portfolio-title">
                                <a href="viewphoto.html?id=${value.PhotoID}">${value.Title}</a>
                            </h4>
                            <span class="theme-portfolio-subtitle">by ${value.Username}<br>${value.CreationTime}</span>
                        </div>
                    </div>`;
            });

            $('#portfolio-4-col-grid-search').html(htmlstr);
            handlePortfolio4ColGridSearch();  
        },
        error: function(xhr) {
            console.log("Search failed: ", xhr.responseText);
            $("#searchquery-container").html("An error occurred while fetching search results.");
        },
        data: JSON.stringify(datadir)
    });
}

function searchPhotos(){
    var query = sessionStorage.getItem('query');

    var datadir = { query: query };

    $.ajax({
        url: `${API_URL}/search`,
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {                        
            console.log(data);
            sessionStorage.setItem('searchdata', JSON.stringify(data));
            loadSearchPage();
        },
        error: function() {
            console.log("Search failed");
        },        
        data: JSON.stringify(datadir)
    }); 
}

function processAddPhoto(filename, title, description, tags){
    var username = sessionStorage.getItem('username');    
    var uploadedFileURL = `https://${PHOTOGALLERY_S3_BUCKET_URL}.s3.amazonaws.com/photos/${filename}`;

    var datadir = {
        username: username,
        title: title,
        description: description,
        tags: tags,
        uploadedFileURL: uploadedFileURL
    };

    console.log(datadir);

    $.ajax({
        url: `${API_URL}/photos`,
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {                        
            console.log(data);
            location.href='index.html';            
        },
        error: function() {
            console.log("Failed");
        },        
        data: JSON.stringify(datadir)
    }); 
}

function handlePortfolio4ColGridSearch() {
        $('#portfolio-4-col-grid-search').cubeportfolio({
            filters: '#portfolio-4-col-grid-filter',
            layoutMode: 'grid',
            defaultFilter: '*',
            animationType: 'rotateRoom',
            gapHorizontal: 30,
            gapVertical: 30,
            gridAdjustment: 'responsive',
            mediaQueries: [{
                width: 1500,
                cols: 4
            }, {
                width: 1100,
                cols: 4
            }, {
                width: 800,
                cols: 4
            }, {
                width: 550,
                cols: 2
            }, {
                width: 320,
                cols: 1
            }],
            caption: ' ',
            displayType: 'bottomToTop',
            displayTypeSpeed: 100,

            // lightbox
            lightboxDelegate: '.cbp-lightbox',
            lightboxGallery: true,
            lightboxTitleSrc: 'data-title',
            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
        });
    }

function handlePortfolio4ColGrid() {
        $('#portfolio-4-col-grid').cubeportfolio({
            filters: '#portfolio-4-col-grid-filter',
            layoutMode: 'grid',
            defaultFilter: '*',
            animationType: 'rotateRoom',
            gapHorizontal: 30,
            gapVertical: 30,
            gridAdjustment: 'responsive',
            mediaQueries: [{
                width: 1500,
                cols: 4
            }, {
                width: 1100,
                cols: 4
            }, {
                width: 800,
                cols: 4
            }, {
                width: 550,
                cols: 2
            }, {
                width: 320,
                cols: 1
            }],
            caption: ' ',
            displayType: 'bottomToTop',
            displayTypeSpeed: 100,

            // lightbox
            lightboxDelegate: '.cbp-lightbox',
            lightboxGallery: true,
            lightboxTitleSrc: 'data-title',
            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
        });
    }

function checkIfLoggedIn(){
    var email = sessionStorage.getItem('email');
    var username = sessionStorage.getItem('username');
    if (email == null || username == null) {
            location.href='login.html';
    }
}

function loadHomePage(){
    checkIfLoggedIn();
    $("#userdata-container").html("Logged in as "+sessionStorage.getItem('name')+" ("+sessionStorage.getItem('username')+")");
    var datadir = {};
    var htmlstr="";
    $.ajax({
        url: `${API_URL}/photos`,
        type: 'GET',
        crossDomain: true,
        contentType: "application/json",
        success: function(data) {
            console.log(data);
            $.each(data.body, function(index, value) {
                //console.log(value);
                htmlstr = htmlstr + '<div class=\"cbp-item idea web-design theme-portfolio-item-v2 theme-portfolio-item-xs\"> <div class=\"cbp-caption\"> <div class=\"cbp-caption-defaultWrap theme-portfolio-active-wrap\"> <img src=\"'+value.URL+'\" alt=\"\"> <div class=\"theme-icons-wrap theme-portfolio-lightbox\"> <a class=\"cbp-lightbox\" href=\"'+value.URL+'\" data-title=\"Portfolio\"> <i class=\"theme-icons theme-icons-white-bg theme-icons-sm radius-3 icon-focus\"></i> </a> </div> </div> </div> <div class=\"theme-portfolio-title-heading\"> <h4 class=\"theme-portfolio-title\"><a href=\"viewphoto.html?id='+value.PhotoID+'\">'+value.Title+'</a></h4> <span class=\"theme-portfolio-subtitle\">by '+value.Username+'<br>'+value.CreationTime+' </span> <span style="padding: 1em;position: relative;"><button data-PhotoID="'+value.PhotoID+'" data-CreationTime="'+value.CreationTime+'" id="home_delete" class="btn-danger">Delete</button></span> </div> </div>';
                });
            console.log(htmlstr);
            $('#portfolio-4-col-grid').html(htmlstr);
            handlePortfolio4ColGrid();
            
        },
        error: function() {
            console.log("Failed");
        }
    });    
}

function loadAddPhotosPage(){
    checkIfLoggedIn();
    $("#userdata-container").html("Logged in as "+sessionStorage.getItem('name')+" ("+sessionStorage.getItem('username')+")");
}

function loadViewPhotoPage(){
    checkIfLoggedIn();
    $("#userdata-container").html("Logged in as "+sessionStorage.getItem('name')+" ("+sessionStorage.getItem('username')+")");

    var PhotoID = $.urlParam('id');
    console.log("Viewing Photo ID: ", PhotoID);

    $.ajax({
        url: `${API_URL}/photos/${PhotoID}`,
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {            
            console.log("Photo Data: ", data);
            var photo = data.body[0];

            $('#viewphoto-container').html(`
                <img class="img-responsive" src="${photo.URL}" alt="">
                <div style="display: block; float: right; margin: 1em;">
                    <button id="photo_update" data-photo="${photo.PhotoID}">Update</button>
                    <button id="photo_delete" data-photo="${photo.PhotoID}">Delete</button>
                </div>
                <div class="blog-grid-content">
                    <h2 class="blog-grid-title-lg"><a class="blog-grid-title-link">${photo.Title}</a></h2>
                    <p>By: ${photo.Username}</p>
                    <p>Uploaded: ${photo.CreationTime}</p>
                    <p>${photo.Description}</p>
                </div>
            `);

            var tags = photo.Tags.split(',');
            var tagstr = '';
            tags.forEach(tag => {
                tagstr += `<li><a href="#" class="tag-link" data-tag="${tag.trim()}">${tag.trim()}</a></li>`;
            });
            $('#tags-container').html(tagstr);

            $("#update-title").val(photo.Title);
            $("#update-description").val(photo.Description);
            $("#update-tags").val(photo.Tags);
        },
        error: function() {
            console.log("Failed to load photo details.");
        }
    });
}

// Deleting function
function deletePhotoIndexHtml(photoID, element) {
    if (!confirm("Do you actually want to delete this?")) {
        return;
    }

    $.ajax({
        url: `${API_URL}/photos/${photoID}`,
        type: 'DELETE',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {
            console.log('DELETED', data);

            $(element).closest('.cbp-item').fadeOut(300, function() {
                $(this).remove();
            });
        },
        error: function(xhr) {
            console.log('DELETE FAILED', xhr.responseText);
        },
    });
}

function deletePhotoViewPhotoHtml(photoID) {
    if (!confirm("Do you actually want to delete this?")) {
        return;
    }

    $.ajax({
        url: `${API_URL}/photos/${photoID}`,
        type: 'DELETE',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {
            console.log('DELETED', data);
            window.location.href = 'index.html';
        },
        error: function(xhr) {
            console.log('DELETE FAILED', xhr.responseText);
        },
    });
}



$('#portfolio-4-col-grid').on('click', '#home_delete', function(e) {
    e.preventDefault();
    var $this = $(this);
    var photoID = $this.data('photoid');

    if (photoID) {
        console.log("DELETING!!");
        console.log("PhotoID: ", photoID);
        console.log(`CreationTime: ${$this.data('creationtime')}`);
        deletePhotoIndexHtml(photoID, $this);
    } else {
        console.error("PhotoID missing");
    }
});

$('#viewphoto-container').on('click', '#photo_update', function() {
    console.log("UPDATE!!!!", $(this).data('photo'));
    $("#update-form-container").fadeIn();
});

$('#viewphoto-container').on('click', '#photo_delete', function(e) {
    e.preventDefault;
    var $this = $(this);
    var photoID = $this.data('photo');

    if (photoID) {
        console.log("DELETE!!!! PhotoID: ", photoID);
        deletePhotoViewPhotoHtml(photoID);
    } else {
        console.error("PhotoID missing")
    }
});

$(document).on('click', '.tag-link', function(e) {
    e.preventDefault();
    var tag = $(this).data('tag');
    console.log("Tag captured: ", tag);
    sessionStorage.setItem('query', tag);
    window.location.href = 'search.html';
});

$('#cancel-update').click(function() {
    console.log("Cancel clicked");
    $("#update-form-container").fadeOut();
});

$('#update-photo-form').submit(function(e) {
    e.preventDefault();

    var PhotoID = $.urlParam('id');
    var updatedTitle = $("#update-title").val();
    var updatedDescription = $("#update-description").val();
    var updatedTags = $("#update-tags").val();

    var datadir = {
        title: updatedTitle,
        description: updatedDescription,
        tags: updatedTags
    };

    $.ajax({
        url: `${API_URL}/photos/${PhotoID}`,
        type: 'PUT',
        crossDomain: true,
        dataType: 'json',
        contentType: "application/json",
        success: function(data) {
            console.log("Update successful: ", data);
            alert("Photo updated successfully!");
            location.reload();
        },
        error: function(xhr) {
            console.log("Update failed: ", xhr.responseText);
            alert("Update failed. Please try again.");
        },
        data: JSON.stringify(datadir)
    });
});


$(document).ready(function(){
    $("#loginform" ).submit(function(event) {
      processLogin();
      event.preventDefault();
    });

    $("#signupform" ).submit(function(event) {
      processSignup();
      event.preventDefault();
    });

    $("#addphotoform" ).submit(function(event) {
      event.preventDefault();
      uploadPhoto();
    });

    $("#searchform").submit(function(event) {
        event.preventDefault();
        var query = $("#query").val().trim();
    
        if (query) {
            sessionStorage.setItem('query', query);
            window.location.href = 'search.html';
        }
    });
    
    $("#confirmemail-form" ).submit(function(event) {
      loadConfirmEmailPage();
      event.preventDefault();
    });

    var pathname = window.location.pathname; 
    console.log(pathname);

    if (pathname == '/index.html' || pathname == '/') {
        loadHomePage();
    } else if (pathname == '/addphoto.html') {
        loadAddPhotosPage();
    } else if (pathname == "/viewphoto.html") {
        loadViewPhotoPage();
    } else if (pathname == "/search.html") {
        loadSearchPage();
    } else if (pathname == "/confirmemail.html") {
        var username = sessionStorage.getItem('username');
        $("#username").val(username);        
    }

    $("#logoutlink" ).click(function(event) {
      clearSession();
      event.preventDefault();
    });
});

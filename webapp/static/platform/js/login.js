var loginForm = {
    username: ko.observable(''),
    password: ko.observable(''),
    loader: ko.observable(false),
    errorMessage: ko.observable(''),
    submit: function () {
        loginForm.loader(true);
        var postData = {
            username: loginForm.username(),
            password: loginForm.password(),
            csrfmiddlewaretoken: CSRF_TOKEN,
        };
        $.post("/accounts/login/", postData, function(response) {
            response = JSON.parse(response);
            if (response.success) {
                loginForm.errorMessage('');
                // Redirect to application
                window.location = window.location.origin + '/';
            } else {
                loginForm.errorMessage(response.error);
                loginForm.loader(false);
            }
        }).fail(function() {
            loginForm.errorMessage('Error occured.');
            loginForm.loader(false);
        })
    }
};

$(document).ready(function() {
    ko.applyBindings(loginForm);
});
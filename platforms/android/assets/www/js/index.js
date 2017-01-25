
var app = {

    container: null,
    config: {
        clientId: 'poc_android_finger',
        username: '',
        password: '',
        token: '',
        disableBackup: false,
        maxAttempts: 5,
        locale: 'it',
        userAuthRequired: true,
        dialogTitle: 'POC android finger',
        dialogMessage: 'Utilizzare le impronte digitali per effetuare il login',
        dialogHint: ''
    },

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.getElementById('btnRegister').addEventListener('click', this.onRegisterClick.bind(this),false);
        document.getElementById('btnLogin').addEventListener('click', this.onLoginClick.bind(this),false);

        app.checkLoginAvailable();
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        
        app.container = document.getElementById('app');

        FingerprintAuth.isAvailable(
            function success(result){
                app.log("Fingerprint response: " + JSON.stringify(result));

                if(result.isAvailable){
                    app.log("Fingerprint is available. ");

                    document.getElementById('register').style.display = "block";
                    //app.register("test","password");
                }else{
                    if(result.isHardwareDetected){
                        app.log("Fingerprint is NOT enabled from settings");
                    }else{
                        app.log("Fingerprint is NOT available. ");
                    }
                    
                }

                
            },
            function failure(message){
                app.log("Error: " + message);
            } 
        );

    },

    onRegisterClick: function(){
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        if(username && password){
            app.register(username, password);
        }else{
            app.log('Missing username or password');
        }
    },

    onLoginClick: function(){
        var token = localStorage.getItem(app.config.clientId);
        app.login(token);
    },

    checkLoginAvailable: function(){
        if(localStorage[app.config.clientId]){
            document.getElementById('login').style.display="block";
        }
    },

    log: function(message){
        var p = document.createElement('p');
        p.innerText = message;
        app.container.appendChild(p);
    },

    register: function(user,password){

        app.config.user = user;
        app.config.password = password;
        app.config.dialogMessage = "Usare l'impronta digitale da collegare all'utente";

        FingerprintAuth.encrypt(
            app.config, 
            function success(result){
                app.log("Encripted: " + JSON.stringify(result));
                if (result.withFingerprint) {
                    app.log("Successfully encrypted credentials. Encrypted credentials: " + result.token);
                    
                    localStorage.setItem(app.config.clientId,result.token);
                    app.checkLoginAvailable();
                    
                    app.log("Token stored");
                } else if (result.withBackup) {
                    app.log("Authenticated with backup password");
                }
            }, 
            function error(error){
                if (error === "Cancelled") {
                    app.log("FingerprintAuth Dialog Cancelled!");
                } else {
                    app.log("FingerprintAuth Error: " + error);
                }
            }
        );
    },

    login: function(token){
        if(!token) return log('User not found, unable to login with fingerprint');
        app.config.token = token;

        FingerprintAuth.decrypt(
            app.config, 
            function successCallback(result){
                app.log("login success: " + JSON.stringify(result));
                if (result.withFingerprint) {
                    app.log("Successful biometric authentication.");
                    app.log("Successfully decrypted credential token.");
                    app.log("password: " + result.password);  
                } else if (result.withBackup) {
                    app.log("Authenticated with backup password");
                    app.log("password: " + result.password);  
                }
            },
            function errorCallback(error){
                if (error === "Cancelled") {
                    app.log("FingerprintAuth Dialog Cancelled!");
                } else {
                    app.log("FingerprintAuth Error: " + error);
                }
            }
        );

    }
};

app.initialize();
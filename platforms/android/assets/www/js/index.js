
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

    /*
        Interesting part...
    */

    //checks if there is already a token registered 
    //this should stay on server...
    checkLoginAvailable: function(){
        if(localStorage[this.config.clientId]){
            document.getElementById('login').style.display="block";
        }
    },
    //store the user fingerprint token (used to decrypt the psw)
    //this should stay on server...
    storeToken: function(token){
        localStorage.setItem(this.config.clientId,token);
    },
    //link a user login with the fingerprints
    register: function(user,password){

        this.config.user = user;
        this.config.password = password;
        this.config.dialogMessage = "Usare l'impronta digitale da collegare all'utente";

        FingerprintAuth.encrypt(
            this.config, 
            function success(result){
                this.log("Encripted: " + JSON.stringify(result));
                if (result.withFingerprint) {
                    this.log("Successfully encrypted credentials. Encrypted credentials: " + result.token);
                    
                    this.storeToken(result.token);

                    this.checkLoginAvailable();
                    
                    this.log("Token stored");
                } else if (result.withBackup) {
                    this.log("Authenticated with backup password");
                }
            }.bind(this), 
            function error(error){
                if (error === "Cancelled") {
                    this.log("FingerprintAuth Dialog Cancelled!");
                } else {
                    this.log("FingerprintAuth Error: " + error);
                }
            }.bind(this)
        );
    },
    //retreive a user password, decripting its key with the token and the fingerprint
    login: function(token){
        if(!token) return log('User not found, unable to login with fingerprint');
        this.config.token = token;

        FingerprintAuth.decrypt(
            this.config, 
            function successCallback(result){
                this.log("login success: " + JSON.stringify(result));
                if (result.withFingerprint) {
                    this.log("Successful biometric authentication.");
                    this.log("Successfully decrypted credential token.");
                    this.log("password: " + result.password);  
                } else if (result.withBackup) {
                    this.log("Authenticated with backup password");
                    this.log("password: " + result.password);  
                }
            }.bind(this),
            function errorCallback(error){
                if (error === "Cancelled") {
                    this.log("FingerprintAuth Dialog Cancelled!");
                } else {
                    this.log("FingerprintAuth Error: " + error);
                }
            }.bind(this)
        );

    },





    /*
    *    PoC UTILITY FUNCTIONS
    */

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.getElementById('btnRegister').addEventListener('click', this.onRegisterClick.bind(this),false);
        document.getElementById('btnLogin').addEventListener('click', this.onLoginClick.bind(this),false);

        this.checkLoginAvailable();
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        
        this.container = document.getElementById('app');

        var that = this;
        FingerprintAuth.isAvailable(
            function success(result){
                that.log("Fingerprint response: " + JSON.stringify(result));

                if(result.isAvailable){
                    that.log("Fingerprint is available. ");

                    document.getElementById('register').style.display = "block";
                    //this.register("test","password");
                }else{
                    if(result.isHardwareDetected){
                        that.log("Fingerprint is NOT enabled from settings");
                    }else{
                        that.log("Fingerprint is NOT available. ");
                    }
                    
                }

                
            },
            function failure(message){
                that.log("Error: " + message);
            } 
        );

    },

    onRegisterClick: function(){
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        if(username && password){
            this.register(username, password);
        }else{
            this.log('Missing username or password');
        }
    },

    onLoginClick: function(){
        var token = localStorage.getItem(this.config.clientId);
        this.login(token);
    },

    log: function(message){
        var p = document.createElement('p');
        p.innerText = message;
        this.container.appendChild(p);
    }
};

app.initialize();
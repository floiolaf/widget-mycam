/*global requirejs cprequire cpdefine chilipeppr THREE*/
// ignore this errormessage:

// ChiliPeppr Widget/Element Javascript

requirejs.config({
    /*
    Dependencies can be defined here. ChiliPeppr uses require.js so
    please refer to http://requirejs.org/docs/api.html for info.
    
    Most widgets will not need to define Javascript dependencies.
    
    Make sure all URLs are https and http accessible. Try to use URLs
    that start with // rather than http:// or https:// so they simply
    use whatever method the main page uses.
    
    Also, please make sure you are not loading dependencies from different
    URLs that other widgets may already load like jquery, bootstrap,
    three.js, etc.
    
    You may slingshot content through ChiliPeppr's proxy URL if you desire
    to enable SSL for non-SSL URL's. ChiliPeppr's SSL URL is
    https://i2dcui.appspot.com which is the SSL equivalent for
    http://chilipeppr.com
    */
    paths: {
        // Example of how to define the key (you make up the key) and the URL
        // Make sure you DO NOT put the .js at the end of the URL
        // SmoothieCharts: '//smoothiecharts.org/smoothie',
    },
    shim: {
        // See require.js docs for how to define dependencies that
        // should be loaded before your script/widget.
    }
});

cprequire_test(["inline:com-chilipeppr-widget-mycam"], function(myWidget) {

    // Test this element. This code is auto-removed by the chilipeppr.load()
    // when using this widget in production. So use the cpquire_test to do things
    // you only want to have happen during testing, like loading other widgets or
    // doing unit tests. Don't remove end_test at the end or auto-remove will fail.

    console.log("test running of " + myWidget.id);

    $('body').prepend('<div id="testDivForFlashMessageWidget"></div>');

    chilipeppr.load(
        "#testDivForFlashMessageWidget",
        "http://fiddle.jshell.net/chilipeppr/90698kax/show/light/",
        function() {
            console.log("mycallback got called after loading flash msg module");
            cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                //console.log("inside require of " + fm.id);
                fm.init();
            });
        }
    );

    /* deactivate cuz of mixed ssl and non ssl content

    // load spjs widget so we can test
    //http://fiddle.jshell.net/chilipeppr/vetj5fvx/show/light/
    $('body').append('<div id="testDivForSpjsWidget"></div>');
    chilipeppr.load(
        "#testDivForSpjsWidget",
        "http://fiddle.jshell.net/chilipeppr/vetj5fvx/show/light/",
        function() {
            console.log("mycallback got called after loading spjs module");
            cprequire(["inline:com-chilipeppr-widget-serialport"], function(spjs) {
                //console.log("inside require of " + fm.id);
                spjs.init();
                spjs.consoleToggle();
                
                // init my widget
                myWidget.init();

                $('#' + myWidget.id).css('margin', '10px');
                $('#testDivForSpjsWidget').css('margin', '10px');

            });
        }
    );
    */
    
    $('title').html(myWidget.name);
    myWidget.init();
} /*end_test*/ );

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:com-chilipeppr-widget-mycam", ["chilipeppr_ready", /* other dependencies here */ ], function() {
    return {
        /**
         * The ID of the widget. You must define this and make it unique.
         */
        id: "com-chilipeppr-widget-mycam", // Make the id the same as the cpdefine id
        name: "Widget / myCam", // The descriptive name of your widget.
        desc: "This widget loads a webcam view in ChiliPeppr using Linux Mjpg-Stream.", // A description of what your widget does
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        /**
         * Define pubsub signals below. These are basically ChiliPeppr's event system.
         * ChiliPeppr uses amplify.js's pubsub system so please refer to docs at
         * http://amplifyjs.com/api/pubsub/
         */
        /**
         * Define the publish signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        publish: {
            // Define a key:value pair here as strings to document what signals you publish.
            // '/onExampleGenerate': 'Example: Publish this signal when we go to generate gcode.'
        },
        /**
         * Define the subscribe signals that this widget/element owns or defines so that
         * other widgets know how to subscribe to them and what they do.
         */
        subscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // so other widgets can publish to this widget to have it do something.
            // '/onExampleConsume': 'Example: This widget subscribe to this signal so other widgets can send to us and we'll do something with it.'
        },
        /**
         * Document the foreign publish signals, i.e. signals owned by other widgets
         * or elements, that this widget/element publishes to.
         */
        foreignPublish: {
            // Define a key:value pair here as strings to document what signals you publish to
            // that are owned by foreign/other widgets.
            // '/jsonSend': 'Example: We send Gcode to the serial port widget to do stuff with the CNC controller.'
        },
        /**
         * Document the foreign subscribe signals, i.e. signals owned by other widgets
         * or elements, that this widget/element subscribes to.
         */
        foreignSubscribe: {
            // Define a key:value pair here as strings to document what signals you subscribe to
            // that are owned by foreign/other widgets.
            // '/com-chilipeppr-elem-dragdrop/ondropped': 'Example: We subscribe to this signal at a higher priority to intercept the signal. We do not let it propagate by returning false.'
        },
        /**
         * All widgets should have an init method. It should be run by the
         * instantiating code like a workspace or a different widget.
         */
        init: function() {
            console.log("I am being initted. Thanks.");

            this.setupUiFromLocalStorage();
            this.btnSetup();
            this.forkSetup();
            
            //this.initCam();
            setTimeout(this.initCheckForCam.bind(this), 2000);
            
            this.setupPubSubForSpjsConnect();
            //this.subscribeToLowLevelSerial();

            console.log("I am done being initted.");
        },
        /**
         * When this widget is activated
         */
        activate: function() {
            this.initCheckForCam();
        },
        /**
         * When this widget is deactivated
         */
        deactivate: function() {
            
        },
        
        // ---------------
        // Cam check/install region
        // ---------------
        
        /** When this widget is activated, we need to do a few things:
         * 1. Check if there is a stored setting of what cam to connect to
         *    because this could be a different host than what SPJS is running
         *    on.
         * If no setting:
         * 1. Check if we are SPJS connected
         * 2. Check if we are on a Raspberry Pi
         * 3. If so, then see if uv4l is installed
         * 4. If so, then launch it
         * 5. Connect
         * If not Raspi, show error.
         * If no uv4l, go into install process.
         */
        isRunningInitCheckForCam: false,
        initCheckForCam: function() {
            
            // check settings and see if there is a stored ip addr to connect to
            console.log("initting check for cam");
            
            if (this.isRunningInitCheckForCam) {
                console.warn("we are currently running initCheckForCam. Exiting.");
                return;
            }
            
            this.isRunningInitCheckForCam = true;
            
            // lets ensure all our install msg divs are hidden
            $('#' + this.id + " .install-msg").addClass("hidden");
            
            //debugger;
            
            var that = this;
            
            // else just try to see if spjs host is raspi, and has cam
            this.checkIfSpjsConnected(function(results) {
                if (results.connected) {
                    
                    // great, we're connected, lets' do next step
                    $('#' + that.id + " .notconnected").addClass("hidden");
                    
                    // check if we are on linux
                    that.checkIfLinux(function(status) {
                        
                        console.log("got callback from checking if linux. status:", status);
                        
                        if (status.OS.match(/linux/i)) {
                            
                            if (status.Arch.match(/arm/i)) {
                                
                                that.checkIfRaspberryPi(function(status) {
                                    
                                    // when we get here, we get back a status to determine
                                    // if we're on a raspi or not
                                    console.log("we got back from checkIfRaspberryPi. status:", status);
                                    
                                    if (status.isRaspberryPi) {
                                
                                        // awesome. we are raspi. we can install
                                        $('#' + that.id + " .eligible").removeClass("hidden");
                                        that.isRunningInitCheckForCam = false;
                                        
                                    } else {
                                        console.log("at least is linux. show error");
                                        $('#' + that.id + " .linux").removeClass("hidden");
                                        that.isRunningInitCheckForCam = false;
                                    }
                                
                                });
                                
                            } else {
                                console.log("at least is linux. show error");
                                $('#' + that.id + " .linux").removeClass("hidden");
                                that.isRunningInitCheckForCam = false;
                            }
                            
                        } else {
                            console.log("We are not Linux, so giving up. Show error"); 
                            var os = status.OS.charAt(0).toUpperCase() + status.OS.slice(1);
                            $('#' + that.id + " .bados .os").text(os);
                            $('#' + that.id + " .bados").removeClass("hidden");
                            that.isRunningInitCheckForCam = false;
                        }
                    });
                    
                } else {
                    // not connected, show error
                    $('#' + that.id + " .notconnected").removeClass("hidden");
                    that.isRunningInitCheckForCam = false;
                }
            });
        },
        /**
         * Subscribe to connect/disconnect events for SPJS so we can pivot off
         * of it for detection.
         */
        setupPubSubForSpjsConnect: function() {
           chilipeppr.subscribe('/com-chilipeppr-widget-serialport/ws/onconnect', this, this.onSpjsConnect); 
           chilipeppr.subscribe('/com-chilipeppr-widget-serialport/ws/ondisconnect', this, this.onSpjsDisconnect); 
        },
        onSpjsConnect: function() {
            // check for cam 1 sec later
            setTimeout(this.initCheckForCam.bind(this), 1000);
        },
        onSpjsDisconnect: function() {
            this.initCheckForCam();
        },
        /**
         * Attach all events to the install div to enable everything to work.
         */
        setupInstall: function() {
            $('#' + this.id + " . btn-install").click(this.installCamServer.bind(this));
        },
        /**
         * Install Cam Server
         */
        installCamServer: function() {
            // We need to send lots of commands to install the server
            
        },
        sendExecRuntime: function() {
            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "execruntime");  
        },
        send: function(cmd) {
            chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", "exec " + cmd);  
        },
        isAreWeSubscribedToLowLevel: false,
        subscribeToLowLevelSerial: function() {
            // subscribe to websocket events
            if (this.isAreWeSubscribedToLowLevel == false) {
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.onWsRecv);
            } else {
                console.log("we were asked to subscribe to low-level /ws/recv but already were");
            }
        },
        unsubscribeFromLowLevelSerial: function() {
            // unsubscribe to websocket events
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/ws/recv", this.onWsRecv);
            this.isAreWeSubscribedToLowLevel = false;
            
        },
        onWsRecv: function(msg) {
            if (msg.match(/^\{/)) {
                // it's json
                var data = $.parseJSON(msg);
                console.log("got json for onWsRecv. data:", data);
                
                if ('ExecStatus' in data) {
                    //this.appendLog(data.Output + "\n");      
                    if (this.isInRaspiCheckMode) {
                        this.checkIfRaspberryPiCallback(data);
                    }
                } else if ('ExecRuntimeStatus' in data) {
                    this.onExecRuntimeStatus(data);
                }
            }
        },
        isInRaspiCheckMode: false,
        raspiCapture: "",
        isRaspberryPi: false,
        checkRaspiUserCallback: null,
        checkIfRaspberryPi: function(callback) {
            this.checkRaspiUserCallback = callback;
            this.isInRaspiCheckMode = true;
            this.subscribeToLowLevelSerial();
            // we potentially have a raspi candidate. send actual cmd line and parse that
            this.send('cat /etc/os-release');
            this.send('echo "done-with-cat-etc-release"');
        },
        checkIfRaspberryPiCallback: function(payload) {
            
            // analyze what's coming back
            if (payload.Output.match(/done-with-cat-etc-release/)) {
                // we are done capturing
                this.isInRaspiCheckMode = false;
                this.unsubscribeFromLowLevelSerial();
                
                console.log("done capturing");
                //this.appendLog('We captured\n<span style="color:red">' + this.raspiCapture + '</span>');
                
                var status = {
                    isRaspberryPi: false
                };
                
                if (this.raspiCapture.match(/raspbian/i)) {
                    // looks like we're on a raspi
                    //this.appendLog("You are running SPJS on a Raspberry Pi.\n");
                    //this.showAsRaspi();
                    status.isRaspberryPi = true;
                } else {
                    // It's not raspi
                    //this.resetAsRaspi();
                    
                }
                
                if (this.checkRaspiUserCallback) this.checkRaspiUserCallback(status);
                
                this.raspiCapture = "";
            } else {
                this.raspiCapture += payload.Output;
                
            }
        },
        isInCheckLinuxMode: false,
        checkLinuxCallback: null,
        checkIfLinux: function(callback) {
            // we can check if linux by asking for an execruntime status
            // subscribe to low-level callback
            this.checkLinuxCallback = callback;
            this.isInCheckLinuxMode = true;
            this.subscribeToLowLevelSerial();
            this.sendExecRuntime();
        },
        execruntime: null,
        onExecRuntimeStatus: function(json) {
            console.log("got onExecRuntimeStatus. json:", json);
            //this.appendLog(JSON.stringify(json) + "\n");
            
            this.execruntime = json;
            
            this.unsubscribeFromLowLevelSerial();
            
            this.isInCheckLinuxMode = false;

            if (this.checkLinuxCallback) this.checkLinuxCallback(json);
            this.checkLinuxCallback = null;
            
            /*
            if (json.OS.match(/linux/i) && json.Arch.match(/arm/i)) {
                this.execruntime = json;
                //this.checkIfRaspberryPi();
                //setTimeout(this.askForPwd.bind(this), 1000);
            }
            */
        },
        isSpjsStatusInitted: false,
        statusCallback: null,
        checkIfSpjsConnected: function(callback) {
            this.statusCallback = callback;
            this.requestSpjsStatus();
        },
        requestSpjsStatus: function() {
            // we need to ask spjs to get a version back
            if (this.isSpjsStatusInitted == false) {
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvStatus", this, this.onRequestSpjsStatusCallback);
                this.isSpjsStatusInitted = true;
            }
            
            // wait about 2 seconds just to wait a bit for connecting
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/requestStatus");
            }, 1000);
            
        },
        onRequestSpjsStatusCallback: function(payload) {
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/recvStatus", this.onRequestSpjsStatusCallback);
            this.isSpjsStatusInitted = false;
            this.statusCallback(payload);
        },
        /**
         * We actually do the install here
         */
        installUv4lOnRaspi: function() {
            var cmds = [
                ''
            ]
        },
        
        // ---------------
        // End Cam check/install region
        // ---------------
        


        signalling_server_hostname : "localhost", //location.hostname || "192.168.1.16",
        signalling_server_address : this.signalling_server_hostname + ':' + 443, //(location.port || 80),
        isFirefox : typeof InstallTrigger !== 'undefined', // Firefox 1.0+
        /**
         * Initialize the Cam widget
         */
        initCam: function() {
            
            // you need to install uv4l on raspi
            // follow the instructions at
            // http://www.linux-projects.org/modules/sections/index.php?op=viewarticle&artid=14
            
            // you need to activate ssl so it works inside cloud9
            //
            // ok, here's the deal with generating certs for uv4l. run this command
            // the important part is the -nodes where no password is attached
            // to the file so that uv4l can read it in
            // sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx.key -out nginx.crt
            //
            // for the config file, here are the key items
            // server-option = --use-ssl=yes
            // server-option = --ssl-private-key-file=/etc/uv4l/nginx.key
            // server-option = --ssl-certificate-file=/etc/uv4l/nginx.crt
            // driver = uvc
            // device-id = 1908:2311
            // auto-video_nr = yes
            //
            // and then the command line to run uv4l
            // sudo uv4l --config-file=/etc/uv4l/uv4l-cam.conf --device-id 1908:2311 -v -f
            //
            // optional command to run on raspberry pi after installing uv4l
            // sudo uv4l -nopreview --auto-video_nr --driver uvc --device-id 1908:2311 --server-option '--use-ssl=yes' --server-option '--ssl-certificate-file=/etc/uv4l/cp.includesprivatekey.pem' -v -f

            
            /*
            addEventListener("DOMContentLoaded", function() {
                document.getElementById('signalling_server').value = signalling_server_address;
                if (!('MediaSource' in window) || location.protocol !== "https:" || !isFirefox) {
                    if (document.getElementById('cast_tab'))
                        document.getElementById('cast_tab').disabled = true;
                    document.getElementById('cast_screen').disabled = true;
                    document.getElementById('cast_window').disabled = true;
                    document.getElementById('cast_application').disabled = true;
                    document.getElementById('note2').style.display = "none";
                    document.getElementById('note4').style.display = "none";
                } else {
                    document.getElementById('note1').style.display = "none";
                    document.getElementById('note3').style.display = "none";
                }
            });
            */  
            
            window.onbeforeunload = function() {
                if (this.ws) {
                    this.ws.onclose = function () {}; // disable onclose handler first
                    this.stop();
                }
            };
            
            navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
            this.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            this.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
            this.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate
            this.URL =  window.URL || window.webkitURL
        },
        onBtnStart1Click: function(evt) {
            // hide popover
            $('#' + this.id + " .btn-start1streaming").popover('hide');
            $('#' + this.id).find('.mjpeg-image').attr("src", this.options.mjpegurl1);
            $('.panel-title').html = 'myCam (Spindle Camera Selected)'
            //this.start();
        },
        onBtnStart2Click: function(evt) {
            // hide popover
            $('#' + this.id + " .btn-start2streaming").popover('hide');
            $('#' + this.id).find('.mjpeg-image').attr("src", this.options.mjpegurl2);
            $('.panel-title').html = 'myCam (Accessories Camera Selected)'
            //this.start();
        },
        onBtnStopClick: function(evt) {
            // hide popover
            $('#' + this.id).find('.mjpeg-image').attr("src", 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
            $('#' + this.id + " .btn-stopstreaming").popover('hide');
            //this.stop();
        },
        ws: null,
        pc: null, 
        audio_video_stream: null,
        pcConfig : {"iceServers": [
                {"urls": ["stun:stun.l.google.com:19302"/*, "stun:" + signalling_server_hostname + ":3478"*/]}
            ]},
        pcOptions: {
            optional: [
                {DtlsSrtpKeyAgreement: true}
            ]
        },
        mediaConstraints: {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        },
        RTCPeerConnection: {},
        RTCSessionDescription: {},
        RTCIceCandidate: {},
        URL: {},
        createPeerConnection: function() {
            try {
                var pcConfig_ = this.pcConfig;
                try {
                    this.ice_servers = document.getElementById('ice_servers').value;
                    if (this.ice_servers) {
                        pcConfig_.iceServers = JSON.parse(this.ice_servers);
                    }
                } catch (e) {
                    alert(e + "\nExample: "
                            + '\n[ {"urls": "stun:stun1.example.net"}, {"urls": "turn:turn.example.org", "username": "user", "credential": "myPassword"} ]'
                            + "\nContinuing with built-in RTCIceServer array");
                }
                console.log(JSON.stringify(pcConfig_));
                this.pc = new this.RTCPeerConnection(pcConfig_, this.pcOptions);
                this.pc.onicecandidate = this.onIceCandidate.bind(this);
                this.pc.onaddstream = this.onRemoteStreamAdded.bind(this);
                this.pc.onremovestream = this.onRemoteStreamRemoved.bind(this);
                console.log("peer connection successfully created!");
            } catch (e) {
                console.log("createPeerConnection() failed");
            }
        },

        onIceCandidate: function(event) {
            if (event.candidate) {
                var candidate = {
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    sdpMid: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                };
                var command = {
                    command_id: "addicecandidate",
                    data: JSON.stringify(candidate)
                };
                this.ws.send(JSON.stringify(command));
            } else {
                console.log("End of candidates.");
            }
        },

        onRemoteStreamAdded: function(event) {
            console.log("Remote stream added:", this.URL.createObjectURL(event.stream));
            var remoteVideoElement = document.getElementById('remote-video');
            remoteVideoElement.src = this.URL.createObjectURL(event.stream);
            remoteVideoElement.play();
            console.log("stream:", event.stream, event);
        },

        onRemoteStreamRemoved: function(event) {
            var remoteVideoElement = document.getElementById('remote-video');
            remoteVideoElement.src = '';
        },


        server: null,
        start: function() {
            // debugger;
            if ("WebSocket" in window) {
                //document.getElementById("stop").disabled = false;
                //document.getElementById("start").disabled = true;
                $('#com-chilipeppr-widget-mycam .btn-stopstreaming').prop('disabled', false);
                $('#com-chilipeppr-widget-mycam .btn-start1streaming').prop('disabled', true);
                $('#com-chilipeppr-widget-mycam .btn-start2streaming').prop('disabled', true);
                $('.panel-title').value = 'myCam'
                document.documentElement.style.cursor ='wait';
                //this.server = document.getElementById("signalling_server").value.toLowerCase();
                this.server = $('#' + this.id + ' #signalling_server').val().toLowerCase();
                
                var protocol = location.protocol === "https:" ? "wss:" : "ws:";
                // for now force to ssl
                protocol = "wss:";
                this.ws = new WebSocket(protocol + '//' + this.server + '/stream/webrtc');

                var that = this;
                
                this.ws.onopen = function () {
                    console.log("onopen()");

                    that.audio_video_stream = null;
                    /*
                    var cast_mic = document.getElementById("cast_mic").checked;
                    var cast_tab = document.getElementById("cast_tab") ? document.getElementById("cast_tab").checked : false;
                    var cast_camera = document.getElementById("cast_camera").checked;
                    var cast_screen = document.getElementById("cast_screen").checked;
                    var cast_window = document.getElementById("cast_window").checked;
                    var cast_application = document.getElementById("cast_application").checked;
                    var echo_cancellation = document.getElementById("echo_cancellation").checked;
                    
                    var localConstraints = {};
                    if (cast_mic) {
                        if (echo_cancellation)
                            localConstraints['audio'] = { optional: [{ echoCancellation: true }] };
                        else
                            localConstraints['audio'] = { optional: [{ echoCancellation: false }] };
                    } else if (cast_tab)
                        localConstraints['audio'] = { mediaSource: "audioCapture" };
                    if (cast_camera)
                        localConstraints['video'] = true;
                    else if (cast_screen)
                        localConstraints['video'] = { frameRate: { ideal: 15, max: 30 }, mozMediaSource: "screen", mediaSource: "screen" };
                    else if (cast_window)
                        localConstraints['video'] = { frameRate: { ideal: 15, max: 30 }, mozMediaSource: "window", mediaSource: "window" };
                    else if (cast_application)
                        localConstraints['video'] = { frameRate: { ideal: 15, max: 30 }, mozMediaSource: "application", mediaSource: "application" };
                    else
                        localConstraints['audio'] = false;

                    this.localVideoElement = document.getElementById('local-video');
                    if (localConstraints.audio || localConstraints.video) {
                        if (navigator.getUserMedia) {
                            navigator.getUserMedia(localConstraints, function(stream) {
                                this.audio_video_stream = stream;
                                offer(stream);
                                this.localVideoElement.muted = true;
                                this.localVideoElement.src = this.URL.createObjectURL(stream);
                                this.localVideoElement.play();
                            }, function(error) {
                                this.stop();
                                alert("An error has occurred. Check media permissions.");
                                console.log(error);
                            });
                        } else {
                            console.log("getUserMedia not supported");
                        }
                    } else {
                        offer();
                    }
                    */
                    that.offer();
                };

                this.ws.onmessage = function (evt) {
                    var msg = JSON.parse(evt.data);
                    //console.log("message=" + msg);
                    console.log("type=" + msg.type);

                    switch (msg.type) {
                        case "offer":
                            that.pc.setRemoteDescription(new that.RTCSessionDescription(msg),
                                function onRemoteSdpSuccess() {
                                    console.log('onRemoteSdpSucces()');
                                    that.pc.createAnswer(function (sessionDescription) {
                                        that.pc.setLocalDescription(sessionDescription);
                                        var command = {
                                            command_id: "answer",
                                            data: JSON.stringify(sessionDescription)
                                        };
                                        that.ws.send(JSON.stringify(command));
                                        console.log(command);

                                    }, function (error) {
                                        alert("Failed to createAnswer: " + error);

                                    }, that.mediaConstraints);
                                },
                                function onRemoteSdpError(event) {
                                    alert('Failed to setRemoteDescription: ' + event);
                                }
                            );

                            var command = {
                                command_id: "geticecandidate"
                            };
                            console.log(command);
                            that.ws.send(JSON.stringify(command));
                            break;

                        case "answer":
                            break;

                        case "message":
                            alert(msg.data);
                            break;

                        case "geticecandidate":
                            var candidates = JSON.parse(msg.data);
                            for (var i = 0; i < candidates.length; i++) {
                                var elt = candidates[i];
                                var candidate = new that.RTCIceCandidate({sdpMLineIndex: elt.sdpMLineIndex, candidate: elt.candidate});
                                that.pc.addIceCandidate(candidate,
                                    function () {
                                        console.log("IceCandidate added: " + JSON.stringify(candidate));
                                    },
                                    function (error) {
                                        console.log("addIceCandidate error: " + error);
                                    }
                                );
                            }
                            document.documentElement.style.cursor ='default';
                            break;
                    }
                };

                this.ws.onclose = function (evt) {
                    if (that.pc) {
                        that.pc.close();
                        that.pc = null;
                    }
                    //document.getElementById("stop").disabled = true;
                    //document.getElementById("start").disabled = false;
                    $('#com-chilipeppr-widget-mycam .btn-stopstreaming').prop('disabled', true);
                    $('#com-chilipeppr-widget-mycam .btn-start1streaming').prop('disabled', false);
                    $('#com-chilipeppr-widget-mycam .btn-start2streaming').prop('disabled', false);
                    $('.panel-title').value = 'myCam'

                    document.documentElement.style.cursor ='default';
                };

                this.ws.onerror = function (evt) {
                    alert("An error has occurred!");
                    if (that.ws) that.ws.close();
                };

            } else {
                alert("Sorry, this browser does not support WebSockets.");
            }
        },
        
        offer: function(stream) {
            this.createPeerConnection();
            if (stream) {
                this.pc.addStream(stream);
            }
            var command = {
                command_id: "offer"
            };
            this.ws.send(JSON.stringify(command));
            console.log("offer(), command=" + JSON.stringify(command));
        },

        stop: function() {
            if (this.audio_video_stream) {
                try {
                    this.audio_video_stream.stop();
                } catch (e) {
                    for (var i = 0; i < this.audio_video_stream.getTracks().length; i++)
                        this.audio_video_stream.getTracks()[i].stop();
                }
                this.audio_video_stream = null;
            }
            //document.getElementById('remote-video').src = '';
            $(this.id + " .remote-video").src = '';
            
            //document.getElementById('local-video').src = '';
            if (this.pc) {
                this.pc.close();
                this.pc = null;
            }
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            $('#' + this.id + " .btn-stopstreaming").prop('disabled', true);
            $('#' + this.id + " .btn-start1streaming").prop('disabled', false);
            $('#' + this.id + " .btn-start2streaming").prop('disabled', false);
            $('.panel-title').value = 'myCam'
            //document.getElementById("stop").disabled = true;
            //document.getElementById("start").disabled = false;
            //document.documentElement.style.cursor ='default';
        },

        mute: function() {
            var remoteVideo = document.getElementById("remote-video");
            remoteVideo.muted = !remoteVideo.muted;
        },

        pause: function() {
            var remoteVideo = document.getElementById("remote-video");
            if (remoteVideo.paused)
                remoteVideo.play();
            else
                remoteVideo.pause();
        },

        fullscreen: function() {
            var remoteVideo = document.getElementById("remote-video");
            if(remoteVideo.requestFullScreen){
                remoteVideo.requestFullScreen();
            } else if(remoteVideo.webkitRequestFullScreen){
                remoteVideo.webkitRequestFullScreen();
            } else if(remoteVideo.mozRequestFullScreen){
                remoteVideo.mozRequestFullScreen();
    	    }
        },

        singleselection: function(name, id) {
            var old = document.getElementById(id).checked;
            var elements = document.getElementsByName(name);
            for(var i = 0; i < elements.length; i++) {
                elements[i].checked = false;
            }
            document.getElementById(id).checked = old ? true : false;
        },

        /**
         * Call this method from init to setup all the buttons when this widget
         * is first loaded. This basically attaches click events to your 
         * buttons. It also turns on all the bootstrap popovers by scanning
         * the entire DOM of the widget.
         */
        btnSetup: function() {

            // bind button click events
            $('#com-chilipeppr-widget-mycam .btn-start1streaming').click(this.onBtnStart1Click.bind(this));
            $('#com-chilipeppr-widget-mycam .btn-start2streaming').click(this.onBtnStart2Click.bind(this));
            $('#com-chilipeppr-widget-mycam .btn-stopstreaming').click(this.onBtnStopClick.bind(this));
            // this.start(); // webrtc

            // Chevron hide/show body
            var that = this;
            $('#' + this.id + ' .hidebody').click(function(evt) {
                console.log("hide/unhide body");
                if ($('#' + that.id + ' .panel-body').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                }
                else {
                    // hide
                    that.hideBody(evt);
                }
            });

            // Ask bootstrap to scan all the buttons in the widget to turn
            // on popover menus
            $('#' + this.id + ' .btn').popover({
                delay: 1000,
                animation: true,
                placement: "auto",
                trigger: "hover",
                container: 'body'
            });

            $('#' + that.id + ' .btn-preferences').click(
                this.showOptionsModal.bind(this)
            );
            
            // options
            var el = $('#' + that.id);
            
            // Save parameter in localspace if user change
            el.find('.mjpeg-url1').change(function(evt) {
                console.log("evt:", evt);
                that.options.mjpegurl1 = evt.currentTarget.value;
                if ($('.panel-title').text() == 'myCam (Spindle Camera Selected)'){
                    el.find('.mjpeg-image').attr("src", that.options.mjpegurl1);
                }
                console.log("options:", that.options);
                that.saveOptionsLocalStorage();
            });
            el.find('.mjpeg-url2').change(function(evt) {
                console.log("evt:", evt);
                that.options.mjpegurl2 = evt.currentTarget.value;
                if ($('.panel-title').text() == 'myCam (Accessories Camera Selected)'){
                    el.find('.mjpeg-image').attr("src", that.options.mjpegurl2);
                }
                console.log("options:", that.options);
                that.saveOptionsLocalStorage();
            });
            /*
            el.find('.CAMXoffset').change(function(evt) {
                that.options.camxoffset = evt.currentTarget.value;
                that.saveOptionsLocalStorage();
            });
            el.find('.CAMYoffset').change(function(evt) {
                that.options.camyoffset = evt.currentTarget.value;
                that.saveOptionsLocalStorage();
            });
            el.find('.ZOOMdistance').change(function(evt) {
                that.options.ZOOMdistance = evt.currentTarget.value;
                // TODO: replace css hover with jquery hover and use ZOOMdistance
                that.saveOptionsLocalStorage();
            });
            */

            // use all parameters from localspace
            if(that.options.mjpegurl1 !== undefined){
                if ($('.panel-title').text() == 'myCam (Spindle Camera Selected)'){
                    el.find('.mjpeg-image').attr("src", that.options.mjpegurl1);
                }
                el.find('.mjpeg-url1').val(that.options.mjpegurl1);
            }
            if(that.options.mjpegurl2 !== undefined){
                if ($('.panel-title').text() == 'myCam (Accessories Camera Selected)'){
                    el.find('.mjpeg-image').attr("src", that.options.mjpegurl2);
                }
                el.find('.mjpeg-url2').val(that.options.mjpegurl2);
            }
            /*
            if(that.options.camxoffset !== undefined){
                el.find('.CAMXoffset').val(that.options.camxoffset);
            }
            if(that.options.camyoffset !== undefined){
                el.find('.CAMYoffset').val(that.options.camyoffset);
            }
            if(that.options.ZOOMdistance !== undefined){
                el.find('.ZOOMdistance').val(that.options.ZOOMdistance);
                // TODO: replace css hover with jquery hover and use ZOOMdistance
            }
            */
            // Trigger a change at all input fields
            el.find('input').trigger('change');

            that.cnt = 0;
            /*
            el.find('.mjpeg-image').click(function(e){
               if(! e.ctrlKey) {
                return;
               }
               var parentOffset = $(this).parent().offset(); 
               //or $(this).offset(); if you really just want the current element's offset
               var relX = e.pageX - parentOffset.left;
               var relY = e.pageY - parentOffset.top;
               var direction = {x:0,y:0,xminus:false,yminus:false};
               // Calculate percent
               direction.x = (relX / $(this).parent().width()) * 100;
               if(direction.x < 50){
                  direction.x = 50 - direction.x;
                  direction.xminus = true;
               } 
               direction.y = (relY / $(this).parent().height()) * 100;
               if(direction.y < 50){
                  direction.y = 50 - direction.y;
                  direction.yminus = true;
               } 

                console.log(direction);

               var offset = that.options.ZOOMdistance; //mm for a 100% percent move

               direction.xdistance = (offset*(direction.x/100));
               if(!direction.xminus)
                  direction.xdistance -= (offset/2);

               direction.ydistance = (offset*(direction.y/100));
               if(! direction.yminus)
                  direction.ydistance -= (offset/2);

               chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
                    D: 'G91 G1 F100' + 
                        ' X'+ (direction.xminus ? '-' : '') + direction.xdistance +  
                        ' Y'+ (direction.yminus ? '' : '-') + direction.ydistance +  
                        '\nG90\n',
                    Id: "CamMove" + that.cnt++
               });
            });
            */
        },
        showOptionsModal: function() {
            $('#' + this.id + ' .preferences-window').modal('show');
        },
        /**
         * User options are available in this property for reference by your
         * methods. If any change is made on these options, please call
         * saveOptionsLocalStorage()
         */
        options: null,
        /**
         * Call this method on init to setup the UI by reading the user's
         * stored settings from localStorage and then adjust the UI to reflect
         * what the user wants.
         */
        setupUiFromLocalStorage: function() {

            // Read vals from localStorage. Make sure to use a unique
            // key specific to this widget so as not to overwrite other
            // widgets' options. By using this.id as the prefix of the
            // key we're safe that this will be unique.

            // Feel free to add your own keys inside the options 
            // object for your own items

            var options = localStorage.getItem(this.id + '-options');
            if (options) {
                options = $.parseJSON(options);
                console.log("just evaled options: ", options);
            }
            else {
                options = {
                    showBody: true,
                    tabShowing: 1,
                    customParam1: null,
                    customParam2: 1.0
                };
            }

            this.options = options;
            console.log("options:", options);

            // show/hide body
            if (options.showBody) {
                this.showBody();
            }
            else {
                this.hideBody();
            }

        },
        /**
         * When a user changes a value that is stored as an option setting, you
         * should call this method immediately so that on next load the value
         * is correctly set.
         */
        saveOptionsLocalStorage: function() {
            // You can add your own values to this.options to store them
            // along with some of the normal stuff like showBody
            var options = this.options;

            var optionsStr = JSON.stringify(options);
            console.log("saving options:", options, "json.stringify:", optionsStr);
            // store settings to localStorage
            localStorage.setItem(this.id + '-options', optionsStr);
        },
        /**
         * Show the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        showBody: function(evt) {
            $('#' + this.id + ' .panel-body').removeClass('hidden');
            $('#' + this.id + ' .panel-footer').removeClass('hidden');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-down');
            $('#' + this.id + ' .overlayWrapper').removeClass('hidden');
            if ($('.panel-title').text() == 'myCam (Accessories Camera Selected)'){
                $('#' + this.id).find('.mjpeg-image').attr("src", this.options.mjpegurl2);
            } else  {
                $('#' + this.id).find('.mjpeg-image').attr("src", this.options.mjpegurl1);
            }
            if (!(evt == null)) {
                this.options.showBody = true;
                this.saveOptionsLocalStorage();
            }
        },
        /**
         * Hide the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        hideBody: function(evt) {
            $('#' + this.id + ' .panel-body').addClass('hidden');
            $('#' + this.id + ' .panel-footer').addClass('hidden');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-down');
            $('#' + this.id + ' .overlayWrapper').addClass('hidden');
            $('#' + this.id).find('.mjpeg-image').attr("src", 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
            if (!(evt == null)) {
                this.options.showBody = false;
                this.saveOptionsLocalStorage();
            }
        },
        /**
         * This method loads the pubsubviewer widget which attaches to our 
         * upper right corner triangle menu and generates 3 menu items like
         * Pubsub Viewer, View Standalone, and Fork Widget. It also enables
         * the modal dialog that shows the documentation for this widget.
         * 
         * By using chilipeppr.load() we can ensure that the pubsubviewer widget
         * is only loaded and inlined once into the final ChiliPeppr workspace.
         * We are given back a reference to the instantiated singleton so its
         * not instantiated more than once. Then we call it's attachTo method
         * which creates the full pulldown menu for us and attaches the click
         * events.
         */
        forkSetup: function() {
            var topCssSelector = '#' + this.id;

            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 1000,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });

            var that = this;
            chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function() {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown-menu'), that);
                });
            });

        },

    }
});
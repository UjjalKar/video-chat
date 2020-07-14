// Getting User-media
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

/**
 * Variables
 */
let me = {};
let myStream;
let peers = {};

init();

function init() {
  if (!navigator.getUserMedia) return display("Unsupported...", "danger");
  getLocalAudioStream(function (err, stream) {
    if (err || !stream) return;
    _playStream(stream, me);
    connectToPeerJS(function (err) {
      if (err) return;
      registerIdWithServer(me.id);
      if (call.peers.length) _callPeers();
      else displayShareMessage(window.location.href);
    });
  });
}

// connecr to peers
function connectToPeerJS(cb) {
  display("Connecting...", "success");
  me = new Peer({
    host: location.hostname,
    port: location.port,
    path: "/peerjs",
  });

  me.on("call", _handleIncomingCall);

  me.on("open", function () {
    display("Connected..", "success");
    cb && cb(null, me);
  });

  me.on("error", function (err) {
    display(err, "error");
    cb && cb(err);
  });
  me.on("disconnected", function () {});
}

// add ID to listt of peerjs IDs
function registerIdWithServer() {
  display("registering... ID ", "success");
  $.post(`/${call.id}/addpeer/${me.id}`);
}

// Remove from list
function unregisterIdWithServer(id) {
  display("removing.... " + id);
  $.post(`/${call.id}/removepeer/${id}`);
}

function _callPeers() {
  call.peers.forEach(callPeer);
}

function callPeer(peerId) {
  display("Calling... " + peerId + "...", "success");
  let peer = getPeer(peerId);
  peer.outgoing = me.call(peerId, myStream);

  peer.outgoing.on("error", function (err) {
    display(err, "danger");
  });

  peer.outgoing.on("stream", function (stream) {
    display("connected", "success");
    _addIncomingStream(peer, stream);
  });
}

// When someone initiated a call via peerjs
function _handleIncomingCall(incoming) {
  console.log("incoming", incoming);
  display("Answering incoming call from " + incoming.peer);
  let peer = getPeer(incoming.peer);
  peer.incoming = incoming;
  incoming.answer(myStream);
  peer.incoming.on("stream", function (stream) {
    _addIncomingStream(peer, stream);
  });
}

/**
 * Call related Helpers
 */

function _addIncomingStream(peer, stream) {
  display("Adding incoming .." + peer.id);
  peer.incomingStream = stream;
  _playStream(stream, peer);
}

function _playStream(stream, peer) {
  const videoId = document.getElementById(peer.id);
  if (videoId) return;
  let video = $("<video class='p-1' autoplay id=" + peer.id + " />").appendTo(
    "#videos"
  );
  video[0].srcObject = stream;
}

// access to your camera and video
function getLocalAudioStream(cb) {
  display('Trying to access microphone and camera please click "Allow"');
  navigator.getUserMedia(
    { video: true, audio: true },
    function success(localStream) {
      display("Loding videos..");
      myStream = localStream;
      if (cb) cb(null, myStream);
    },
    function error(err) {
      display("Unable to connect camera and microphone");
      if (cb) cb(err);
    }
  );
}

/**
 * Helper @functions
 */

function getPeer(peerId) {
  return peers[peerId] || (peers[peerId] = { id: peerId });
}

function displayShareMessage(link) {
  $("#status").html(`
    <div
        class="my-5 alert alert-success alert-dismissible fade show"
        role="alert"
        
      >
      Join Link --> <a href="${link}">${link}</a>
        <button
          type="button"
          class="close"
          data-dismiss="alert"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
  
  `);
}
function display(message, type = "success") {
  $("#status").html(`
    <div
        class="my-5 alert alert-${type} alert-dismissible fade show"
        role="alert"
        
      >
      ${message}
        <button
          type="button"
          class="close"
          data-dismiss="alert"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
  
  `);
}

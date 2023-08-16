document.addEventListener("DOMContentLoaded", () => {
    const APP_ID = "3341710b1b044936858c7d80b3fe3952";
    const TEMP_ID= "007eJxTYFi81Hq7mAvHtYw3wvN+FgX85spi4rw4UbWna/c7u0Aeb34FBmNjE0NzQ4MkwyQDExNLYzMLU4tk8xQLgyTjtFRjS1OjgvQ7KQ2BjAx/DaqZGRkgEMTnYEjOSCwpys/PZWAAAB35Hsc=";
    const CHANNEL_NAME = "chatroom"


  const username = document.getElementById("Name");
  const Button = document.getElementById("join");

  const videostream = document.querySelector(".video-streams");
  const stream_control = document.querySelector(".stream-controls");


  Button.addEventListener("click", () => {
    let usernamevalue = username.value.trim();

    if (usernamevalue === "") {
      Swal.fire({
        icon: "error",
        title: "🙄Oops...",
        text: "Please Enter Your Name!",
      });
    } else {

    let joinname = document.getElementById('display_name')
   


      const agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      let localTracks = []
      let remoteUsers = {}

      let joinAndDisplayLocalStream = async () => {

        agoraEngine.on("user-published", handleUserJoined)
        agoraEngine.on("user-left", handleUserLeft)
        


        let UID = await agoraEngine.join(APP_ID, CHANNEL_NAME, TEMP_ID, null);

        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({encoderConfig: "1080p_1"});

        let player = `<div class="video-container" id="user-container-${UID}">
                            <div class="video-player" id="user-${UID}"></div> 
                      </div>`;

        videostream.insertAdjacentHTML("beforeend", player);

        localTracks[1].play(`user-${UID}`);

        await agoraEngine.publish([localTracks[0], localTracks[1]]);
      };

      let joinStream = async () => {
        await joinAndDisplayLocalStream();
        Button.style.display = "none";
        username.style.display = "none"
        joinname.innerHTML = usernamevalue
        stream_control.style.display = "flex";
      };
      

      let handleUserJoined = async (user, mediaType, usernamevalue) => {
        remoteUsers[user.uid] = user;
        await agoraEngine.subscribe(user, mediaType);
    
        if (mediaType === "video") {
            let player = document.getElementById(`user-container-${user.uid}`);
            if (player != null) {
                player.remove();
            }
    
            player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div>
                        
                        <div class="name">
                          <h1 id="display-name">${usernamevalue}</h1>
                        </div>
                    </div>`;
    
            videostream.insertAdjacentHTML("beforeend", player);
            user.videoTrack.play(`user-${user.uid}`);
        }
    
        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    };
    
    
    let handleUserLeft = async(user) => {
        delete remoteUsers[user.uid]
        document.getElementById(`user-container-${user.uid}`).remove()
    }

    let leaveAndRemoveLocalStream = async () => {
      for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await agoraEngine.leave()
    document.querySelector('.join-btn').style.display = 'block'
    document.querySelector('.stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''

    }

    let toggleMic = async(e)  =>{
      if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = 'cadetblue'
      }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = '<i class="fas fa-microphone"></i> Mic on'
        e.target.style.backgroundColor = '#EE4B2B'
      }

    }

    let toggleCamera = async(e) => {
      if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = 'cadetblue'
      }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#EE4B2B'
      }

    }



document.querySelector(".leave-btn").addEventListener("click", leaveAndRemoveLocalStream)
document.querySelector('.mic-btn').addEventListener("click", toggleMic)
document.querySelector('.camera-btn').addEventListener("click", toggleCamera)
Button.addEventListener("click", joinStream)
    


    }
  });
});

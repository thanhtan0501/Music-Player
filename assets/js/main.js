const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Playlist elements
const playlist = $('.playlist');
const playlistWrapper = $('.playlist-wrapper');

// Song's info elements
const thumbnail = $('.thumbnail');
const title = $('.title');
const author = $('.author');
const audio = $('#audio');

// Control elements
const playPause = $('#play-pause');
const songFlow = $('#song-flow');
const volumeIcon = $('#volume-icon');
const volumeBar = $('.volume-bar');
const progressBar = $('.progress-bar');
const nextBtn = $('#next');
const prevBtn = $('#prev');
const openPlaylist = $('#open-playlist');
const closePlaylist = $('#close-playlist');

// Sound wave strokes
const strokes = `
   <span class="stroke"></span>
   <span class="stroke"></span>
   <span class="stroke"></span>
   <span class="stroke"></span>
   <span class="stroke"></span>
`

// Mouse holding state for progress and volume bar
let isHoldingProgress = false;
let isHoldingVolume = false;

const app = {
    // Current song index
    currentIndex: 0,

    // Control state
    songFlowStates: ['repeat', 'repeat_one', 'shuffle'],
    songFlowIndex: 0,

    // Volume state
    volumeState: 'volume_up',
    volumeOff: false,

    // Playlist is scrolled state
    isScrolled: true,

    // My playlist
    songs: [{
            title: 'Cám Ơn Vì Tất Cả',
            author: 'Anh Quân Idol',
            path: './assets/mp3/CamOnViTatCa.mp3',
            image: './assets/img/img1.jpg',
        },
        {
            title: 'Lạc Vào Trong Mơ',
            author: 'SimonC, WUY',
            path: './assets/mp3/LacVaoTrongMo.mp3',
            image: './assets/img/img2.jpg',
        },
        {
            title: 'Đường Tôi Chở Em Về',
            author: 'Buitruonglinh, Freak D',
            path: './assets/mp3/DuongToiChoEmVe.mp3',
            image: './assets/img/img3.jpg',
        },
        {
            title: 'Xin Đừng Nhấc Máy',
            author: 'B Ray, Masew',
            path: './assets/mp3/XinDungNhacMay.mp3',
            image: './assets/img/img4.jpg',
        },
        {
            title: 'Chưa Bao Giờ',
            author: 'Hà Anh Tuấn',
            path: './assets/mp3/ChuaBaoGio.mp3',
            image: './assets/img/img5.jpg',
        },
        {
            title: 'Hai Mươi Hai',
            author: 'Hứa Kim Tuyền, AMEE',
            path: './assets/mp3/HaiMuoiHai22.mp3',
            image: './assets/img/img6.png',
        },
        {
            title: 'Lạc Vào Em',
            author: 'Lê Vũ',
            path: './assets/mp3/LacVaoEm.mp3',
            image: './assets/img/img7.jpg',
        },
        {
            title: 'Ngày Đầu Tiên',
            author: 'Đức Phúc',
            path: './assets/mp3/NgayDauTien.mp3',
            image: './assets/img/img8.jpg',
        },
        {
            title: 'Suýt Nữa Thì',
            author: 'Andiez',
            path: './assets/mp3/SuytNuaThiChuyenDiCuaThanhXuan.mp3',
            image: './assets/img/img9.jpg',
        },
        {
            title: 'Vì Mẹ Anh Bắt Chia Tay',
            author: 'Miu Lê, Karik, Châu Đăng Khoa',
            path: './assets/mp3/ViMeAnhBatChiaTay.mp3',
            image: './assets/img/img10.jpg',
        },

    ],

    // Setting timer format
    timerFormat(duration) {
        const rounded = Math.floor(duration);
        return `${Math.floor(rounded/60) >= 10 ? Math.floor(rounded/60) : '0' + Math.floor(rounded/60)}:${rounded%60 >= 10 ? rounded%60 : '0' + rounded%60}`;
    },

    // Function runs every time song change event happens
    setChangeSong(newIndex) {
        $$('.wave')[this.currentIndex].innerHTML = this.timerFormat($$('.duration-display')[this.currentIndex].duration);
        this.currentIndex = newIndex;
        $$('.wave')[this.currentIndex].innerHTML = strokes;
        this.renderPlayer();
        this.isScrolled = false;
        audio.play();
    },

    // Handle events function
    eventHandler() {
        const playListItems = $$('.playlist-item');

        // Change song every time a song is clicked
        playListItems.forEach((playListItem, index) => {
            playListItem.onclick = () => {
                this.setChangeSong(index);
            }
        })

        // Spinning animation of the thumbnail
        const thumbnailAnimation = thumbnail.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 8000,
            iterations: Infinity
        })

        // Animation paused when initialized
        thumbnailAnimation.pause();

        // Updates song's duration when audio's metadata first update
        audio.onloadedmetadata = () => {
            $('#begin').innerText = this.timerFormat(audio.currentTime);
            $('#end').innerText = this.timerFormat(audio.duration);
        }

        // Updates current time and progress bar
        audio.ontimeupdate = () => {
            let progressBarWidth = (audio.currentTime / audio.duration) * 100;
            $('#begin').innerText = this.timerFormat(audio.currentTime);
            $('.progress').style.width = `${progressBarWidth}%`;
        }

        // Volume change event
        audio.onvolumechange = () => {
            if (audio.muted) volumeIcon.innerHTML = 'volume_off';
            else volumeIcon.innerText = audio.volume >= 0.5 ? 'volume_up' :
                audio.volume < 0.05 ? 'volume_mute' : 'volume_down';
            $('.volume').style.width = `${audio.volume*100}%`;
        }

        // Song's change flow every time a song is ended
        audio.onended = () => {
            if (this.songFlowIndex === 2) {
                // Making sure that the song is not repeated
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * this.songs.length);
                } while (newIndex === this.currentIndex);

                this.setChangeSong(newIndex);
            } else nextBtn.click();
        }

        // Play and pause event
        audio.onplay = () => {
            playPause.innerText = 'pause_circle';
            thumbnailAnimation.play();
        }
        audio.onpause = () => {
            playPause.innerText = 'play_circle';
            thumbnailAnimation.pause();
        }

        // Open playlist
        openPlaylist.onclick = () => {
            playlist.classList.add('active');

            if (!this.isScrolled) {
                setTimeout(() => {
                    $$('.playlist-item')[this.currentIndex].scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }, 200);

                this.isScrolled = true;
            }
        }

        // Close playlist
        closePlaylist.onclick = () => playlist.classList.remove('active');

        // Skip to next or previous song
        nextBtn.onclick = () => {
            if (this.currentIndex === this.songs.length - 1) this.setChangeSong(0);
            else this.setChangeSong(this.currentIndex + 1);
        }
        prevBtn.onclick = () => {
            if (this.currentIndex === 0) this.setChangeSong(this.songs.length - 1);
            else this.setChangeSong(this.currentIndex - 1);
        }

        // Change the flow state
        songFlow.onclick = () => {
            this.songFlowIndex = this.songFlowIndex + 1 > 2 ? 0 : this.songFlowIndex + 1;
            songFlow.innerText = this.songFlowStates[this.songFlowIndex];
            if (this.songFlowIndex === 1) audio.loop = true;
            else audio.loop = false;
        }

        // Play pause button event
        playPause.onclick = () => {
            audio.paused ? audio.play() : audio.pause();
        }

        // Turn on and off the volume
        volumeIcon.onclick = () => {
            audio.muted = !audio.muted;
        }

        // ----------------DRAGGING ANIMATION ON PROGRESS AND VOLUME BAR----------------
        // Mouse down event
        volumeBar.onmousedown = (e) => {
            isHoldingVolume = true;
            audio.volume = e.offsetX / e.target.offsetWidth;
        }
        progressBar.onmousedown = (e) => {
            isHoldingProgress = true;
            audio.currentTime = (e.offsetX / e.target.offsetWidth) * audio.duration;
        }

        // Dragging event
        volumeBar.onmousemove = (e) => {
            if (isHoldingVolume) audio.volume = e.offsetX / e.target.offsetWidth;
        }
        progressBar.onmousemove = (e) => {
            if (isHoldingProgress) audio.currentTime = (e.offsetX / e.target.offsetWidth) * audio.duration;
        }

        // Mouse up event
        window.onmouseup = () => {
            isHoldingProgress = false;
            isHoldingVolume = false;
        }

        // Accessibility improvement with keydown events on space bar & arrow keys
        window.onkeydown = (e) => {
            switch (e.keyCode) {
                case 32:
                    e.preventDefault();
                    playPause.click();
                    break;
                case 37:
                    e.preventDefault();
                    audio.currentTime -= 5;
                    break;
                case 38:
                    e.preventDefault();
                    audio.volume + 0.05 < 1 ? audio.volume += 0.05 : audio.volume = 1;
                    break;
                case 39:
                    e.preventDefault();
                    audio.currentTime += 5;
                    break;
                case 40:
                    e.preventDefault();
                    audio.volume - 0.05 > 0 ? audio.volume -= 0.05 : audio.volume = 0;
                    break;
            }
        }
    },

    // Render the song playlist
    renderPlaylist() {
        const htmls = this.songs.map(song => {
            return `
            <li class="playlist-item">
               <div class="playlist-thumb" style="background-image: url(${song.image})"></div>
               <div class="song-info">
                  <span class="playlist-title">${song.title}</span>
                  <span class="playlist-author">${song.author}</span>
               </div>
               <audio class="duration-display" preload="metadata" src=${song.path}></audio>
               <div class="wave"></div>
            </li>
         `
        }).join('');

        playlistWrapper.innerHTML = htmls;
        const durations = $$('.duration-display');
        const wave = $$('.wave');

        // Initialize isPlaying state and add song's duration at the end for every song in
        // the playlist
        durations.forEach((duration, index) => {
            duration.onloadedmetadata = () => {
                wave[index].innerHTML = index === this.currentIndex ? strokes : this.timerFormat(duration.duration);
            }
        })
    },

    // Render the player
    renderPlayer() {
        const currentSong = this.songs[this.currentIndex];
        thumbnail.style.backgroundImage = `url(${currentSong.image})`;
        title.innerText = currentSong.title;
        author.innerText = currentSong.author;
        audio.src = currentSong.path;
    },

    start() {
        this.renderPlayer();
        this.renderPlaylist();
        this.eventHandler();

        // Initialize the default volume
        audio.volume = 0.5;
    }
}

app.start();
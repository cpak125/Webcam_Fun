const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap')
const effectsButton = document.querySelectorAll('.filters')
const greenScreenSelector = document.querySelector('.rgb')
let filter = ''

getVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(localMediaStream => {
            console.log(localMediaStream)
            video.srcObject = localMediaStream
            video.play()
        })
        .catch(err => {
            console.error(`OH NOO!!!`, err);

        })
}

paintToCanvas = () => {
    const width = video.videoWidth
    const height = video.videoHeight
    canvas.width = width
    canvas.height = height

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height)
        // take pixels out
        let pixels = ctx.getImageData(0, 0, width, height)

        // mess with them
        switch (filter) {
            case 'red':
                pixels = redEffect(pixels)
                ctx.globalAlpha = 1
                greenScreenSelector.classList.add('hidden')
                break
            case 'ghost':
                pixels = rgbSplit(pixels)
                ctx.globalAlpha = 0.1
                greenScreenSelector.classList.add('hidden')
                break
            case 'green-screen':
                pixels = greenScreen(pixels)
                ctx.globalAlpha = 1
                greenScreenSelector.classList.remove('hidden')
                break
            default:
                pixels = pixels
                ctx.globalAlpha = 1
                greenScreenSelector.classList.add('hidden')
        }

        // put them back
        ctx.putImageData(pixels, 0, 0)
    }, 16)
}

takePhoto = () => {
    //play the sound
    snap.currentTime = 0
    snap.play()

    //take the data out of the canvas
    const data = canvas.toDataURL('image/jpeg')
    const link = document.createElement('a')
    link.href = data
    link.setAttribute('download', 'handsome')
    link.innerHTML = `<img src="${data}" alt="Handsome Man"/>`
    strip.insertBefore(link, strip.firstChild)
}

redEffect = (pixels) => {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 100 // RED
        pixels.data[i + 1] = pixels.data[i + 1] - 50 // GREEN
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5 // BLUE
    }
    return pixels
}

rgbSplit = (pixels) => {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i - 150] = pixels.data[i + 0]; // RED
        pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
        pixels.data[i - 550] = pixels.data[i + 2]; // BLUE
    }
    return pixels;
}

greenScreen = (pixels) => {
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });

    for (i = 0; i < pixels.data.length; i = i + 4) {
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if (red >= levels.rmin
            && green >= levels.gmin
            && blue >= levels.bmin
            && red <= levels.rmax
            && green <= levels.gmax
            && blue <= levels.bmax) {
            // take it out!
            pixels.data[i + 3] = 0;
        }
    }

    return pixels;
}
function setFilter(e) {
    e.preventDefault()
    filter = e.target.id
    return filter
}

getVideo()

video.addEventListener('canplay', paintToCanvas)
effectsButton.forEach(effect => effect.addEventListener('click', setFilter))

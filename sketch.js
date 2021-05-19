var permissionRequest, permissionGrantFailedParagraph;
var shirtImage, splatterImage;
var shirtWidth = 300;

function preload() {
    shirtImage = loadImage("shirt.png");
    splatterImage = loadImage("splatter.png");
}

function setup() {
    noCanvas();
    permissionRequest = createDiv();
    permissionRequest.style("padding", "1em");

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
        let permissionInfoParagraph = createP("This application requires access to your device's orientation state to function.");
        permissionInfoParagraph.style("font-family", "Verdana");
        permissionInfoParagraph.style("font-size", "1em");
        permissionRequest.child(permissionInfoParagraph);

        let permissionButton = createButton("Grant Permission");
        permissionButton.style("margin-top", "1em");
        permissionButton.style("padding", "1em 2em");
        permissionButton.style("border", "none");
        permissionButton.style("background-color", "#008CBA");
        permissionButton.style("color", "white");
        permissionButton.style("font-family", "Verdana");
        permissionButton.style("font-size", "1em");
        permissionButton.mousePressed(requestPermission);
        permissionRequest.child(permissionButton);
        requestPermission();
    } else {
        permissionGrantFailedParagraph = createP("Unfortunately only iOS devices are supported!");
        permissionGrantFailedParagraph.style("line-height", "1.5");
        permissionGrantFailedParagraph.style("color", "red");
        permissionGrantFailedParagraph.style("font-family", "Verdana");
        permissionGrantFailedParagraph.style("font-size", "1em");
        permissionGrantFailedParagraph.style("font-weight", "bold");
        permissionRequest.child(permissionGrantFailedParagraph);
    }

}

function requestPermission() {
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            if (response === "granted") {
                permissionRequest.remove();
                setupApplication();
            } else if (!permissionGrantFailedParagraph) {
                permissionGrantFailedParagraph = createP("Unfortunately the required permissions couldn't be granted. Delete the website data and try again.");
                permissionGrantFailedParagraph.style("margin-top", "1em");
                permissionGrantFailedParagraph.style("line-height", "1.5");
                permissionGrantFailedParagraph.style("color", "red");
                permissionGrantFailedParagraph.style("font-family", "Verdana");
                permissionGrantFailedParagraph.style("font-size", "1em");
                permissionRequest.child(permissionGrantFailedParagraph);
            }
        });
}

function setupApplication() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.style("visibility", "visible");
    frameRate(240);

    splatterImage.resize(120, 0);
    shirtImage.resize(shirtWidth, 0);
    image(shirtImage, (width - shirtWidth) / 2, (height - shirtImage.height) / 2);
}

function draw() {
    //deviceMoved();
}

let splettered = false;

function deviceMoved() {
    // Spletter
    if (false || (accelerationX > 8 && !splettered)) {
        splettered = true;
        setTimeout(() => { splettered = false; }, 500);

        noFill();
        noStroke();
        rect((width - shirtWidth) / 2,
            (height - shirtImage.height) / 2,
            (width - shirtWidth) / 2 + shirtWidth - splatterImage.width / 2 - (width - shirtWidth) / 1.5,
            (height - shirtImage.height) / 2 + shirtImage.height - splatterImage.height / 2 - (height - shirtImage.height) / 1.5);

        let r = random(256),
            b = random(256),
            g = random(256),
            rDiff = (255 - r) * 0.75,
            gDiff = (255 - g) * 0.75,
            bDiff = (255 - b) * 0.75;

        let startX = noise(random(100)) * width,
            startY = noise(random(100)) * height;

        while (startX != clamp(startX, (width - shirtWidth) / 2, (width - shirtWidth) / 2 + 150)) {
            startX = noise(random(100)) * width;
        }

        while (startY != clamp(startY, (height - shirtImage.height) / 2, (height - shirtImage.height) / 2 + 275)) {
            startY = noise(random(100)) * height;
        }


        for (let y = 0; y < splatterImage.height; y++) {
            for (let x = 0; x < splatterImage.width; x++) {
                let splatterPixel = splatterImage.get(x, y);
                let shirtPixel = shirtImage.get(startX - (width - shirtWidth) / 2 + x, startY - (height - shirtImage.height) / 2 + y);

                if (startX - (width - shirtWidth) / 2 + x > shirtImage.width || startY - (height - shirtImage.height) / 2 + y > shirtImage.height) {
                    continue;
                }

                if (splatterPixel[3] > 0 && shirtPixel[3] < 20) {
                    strokeWeight(1);
                    stroke(r + (rDiff * (y / splatterImage.height)), g + (gDiff * (y / splatterImage.height)), b + (bDiff * (y / splatterImage.height)), splatterPixel[3]);
                    point(startX + x, startY + y);
                }
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function clamp(number, min, max) {
    if (number < min)
        return min;

    if (number > max)
        return max;

    return number;
}
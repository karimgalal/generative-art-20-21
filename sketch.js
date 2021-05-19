let permissionRequestDiv, permissionGrantFailedParagraph;
let instructionsParagraph;
let shirtImage, splatterImage,
    shirtWidth = 300, shirtHeight,
    shirtX, shirtY;

// Deze functie van p5 runt voordat de applicatie begint
function preload() {
    // Laad shirt en spletter foto's
    shirtImage = loadImage("shirt.png");
    splatterImage = loadImage("splatter.png");
}

// Deze functie van p5 runt automatisch na preload
function setup() {
    // Haal canvas weg, anders krijg je een lege canvas boven, canvas is nog niet nodig
    noCanvas();
    // Maak een div om de request voor de permissions erin te zetten en style hem
    permissionRequestDiv = createDiv();
    permissionRequestDiv.style("padding", "1em");

    // Deze functie bestaat alleen op iOS 13+ devices, dus als typeof === undefined is het iOS lager dan 13 of andere OS
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // Maak een uitleg voor gebruiker waarom je permission nodig hebt en style het
        let permissionInfoParagraph = createP("This application requires access to your device's orientation state to function.");
        permissionInfoParagraph.style("font-family", "Verdana");
        permissionInfoParagraph.style("font-size", "1em");
        // Zet de p als child neer van de div
        permissionRequestDiv.child(permissionInfoParagraph);

        // Maak een knop voor gebruiker om permission aan te vragen, Apple staat alleen toe dat je permission vraagt na input van de gebruiker, en style de knop
        let permissionButton = createButton("Grant Permission");
        permissionButton.style("margin-top", "1em");
        permissionButton.style("padding", "1em 2em");
        permissionButton.style("border", "none");
        permissionButton.style("background-color", "#008CBA");
        permissionButton.style("color", "white");
        permissionButton.style("font-family", "Verdana");
        permissionButton.style("font-size", "1em");
        // Wanneer je klikt op de knop moet requestPermission functie worden gerund
        permissionButton.mousePressed(requestPermission);
        // Maak de knop child van de div
        permissionRequestDiv.child(permissionButton);
        // Apple onthoudt permission tot Safari wordt gerestart, door deze functie handmatig te callen hoef je niet de gebruiker bij elke refresh te vragen om op de knop te klikken
        requestPermission();
    } else {
        // Geen iOS 13+, dus maak een p met een foutmelding
        permissionGrantFailedParagraph = createP("Unfortunately only iOS devices are supported!");
        permissionGrantFailedParagraph.style("line-height", "1.5");
        permissionGrantFailedParagraph.style("color", "red");
        permissionGrantFailedParagraph.style("font-family", "Verdana");
        permissionGrantFailedParagraph.style("font-size", "1em");
        permissionGrantFailedParagraph.style("font-weight", "bold");
        // Maak die p child van de div
        permissionRequestDiv.child(permissionGrantFailedParagraph);
    }
}

function requestPermission() {
    // Vraag toestemming om iPhone orientation te gebruiken
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            // als toestemming verleend mag de div weg en programma mag worden gesetup met onze eigen functie setupApplication
            if (response === "granted") {
                permissionRequestDiv.remove();
                setupApplication();
            }
            // is dat niet het geval en bestaat er niet al een foutmelding, wordt deze op zelfde wijze als de "geen iOS"-melding gemaakt
            // Dit is nodig omdat je anders steeds nieuwe foutmelding aanmaakt elke keer dat de gebruiker blijft klikken op de knop 
            else if (!permissionGrantFailedParagraph) {
                permissionGrantFailedParagraph = createP("Unfortunately the required permissions couldn't be granted. Delete the website data and try again.");
                permissionGrantFailedParagraph.style("margin-top", "1em");
                permissionGrantFailedParagraph.style("line-height", "1.5");
                permissionGrantFailedParagraph.style("color", "red");
                permissionGrantFailedParagraph.style("font-family", "Verdana");
                permissionGrantFailedParagraph.style("font-size", "1em");
                permissionRequestDiv.child(permissionGrantFailedParagraph);
            }
        });
}

function setupApplication() {
    // Maak canvas voor app
    let canvas = createCanvas(windowWidth, windowHeight);
    // p5 maakt visibility automatisch hidden, dus show
    canvas.style("visibility", "visible");

    // Resize spletter en shirt naar de gewenste size
    splatterImage.resize(120, 0);
    shirtImage.resize(shirtWidth, 0);
    shirtHeight = shirtImage.height;

    // Shirt coordinaten
    shirtX = (width - shirtWidth) / 2;
    shirtY = (height - shirtHeight) - ((width - shirtWidth));

    // Zet image van shirt neer met image(imageVariable, x, y)
    image(shirtImage, shirtX, shirtY);

    // Instructies
    instructionsParagraph = createP("Make a throwing movement with your device to splatter paint. Double tap to reset.");
    instructionsParagraph.style("padding", "1.5em");
    instructionsParagraph.style("line-height", "1.5");
    instructionsParagraph.style("line-height", "1.5");
    instructionsParagraph.style("font-family", "Verdana");
    instructionsParagraph.style("font-size", "1em");
    instructionsParagraph.style("font-weight", "bold");
    instructionsParagraph.position(0, 0);
}

let lastTouch;
function touchStarted() {
    console.log(lastTouch);
    let currentTouch = Date.now();
    if ((currentTouch - lastTouch) < 300) {
        clear();
        image(shirtImage, shirtX, shirtY);
    }
    lastTouch = currentTouch;
}

// deviceMoved runt meerdere keren per move, dus sta enkel 1 move toe per 500 ms hiermee
let splettered = false;

// functie van p5, detect device movement
function deviceMoved() {
    // accelerationX is variabel van p5 die de versnelling van de beweging meet, meer dan 8 is een redelijk krachtige beweging, spletter alleen als er niet al binnen 500 ms gespletterd is
    if (accelerationX > 8 && !splettered) {
        // na een spletter dus spletter op true
        splettered = true;
        // en over 500 ms mag hij weer op false zodat een volgende spletter wordt gemaakt bij een beweging
        setTimeout(() => { splettered = false; }, 500);

        // maak random kleur met r, g, b random getal tussen 0 en 255, random(x) geeft random getal tussen 0 en x, exclusief x zelf
        let r = random(256),
            b = random(256),
            g = random(256),
            // de r, g, b's van de eindkleur van de gradient
            rDiff = (255 - r) * 0.75,
            gDiff = (255 - g) * 0.75,
            bDiff = (255 - b) * 0.75;

        // start coordinaten X en Y is random. noise maakt een random getal tussen 0 en 1, * width geeft dus vanaf 0 tot width een startX, zelfde voor startY
        // aanpassingen zijn random trial en error, hiermee wordt het hele shirt goed gedekt
        let startOnShirtX = noise(random(1000)) * shirtWidth - (splatterImage.width * 0.3),
            startOnShirtY = noise(random(1000)) * shirtHeight * 1.1 - (splatterImage.height * 0.45);

        while (!majoritySplatterInShirt(startOnShirtX, startOnShirtY)) {
            startOnShirtX = noise(random(1000)) * shirtWidth - (splatterImage.width * 0.3);
            startOnShirtY = noise(random(1000)) * shirtHeight * 1.1 - (splatterImage.height * 0.45);
        }

        // Roteer door alle pixels van splatterImage
        for (let y = 0; y < splatterImage.height; y++) {
            for (let x = 0; x < splatterImage.width; x++) {
                // Pak de pixel van de spletter op de huidige coordinaten in de for
                let splatterPixel = splatterImage.get(x, y);

                // Als de spletterimage op dat punt een alpha value heeft van groter dan 0, dus niet transparant
                // Check ook of het valt binnen de shirt, want shirt is van binnen transparant
                if (splatterPixel[3] > 0 && splatterPixelInShirt(startOnShirtX + x, startOnShirtY + y)) {
                    // punt moet 1 breed zijn
                    strokeWeight(1);
                    // stel de kleur in afhankelijk van hoe ver we zijn in de gradient, alpha value is hetzelfde als die van de spletterimage
                    stroke(r + (rDiff * (y / splatterImage.height)), g + (gDiff * (y / splatterImage.height)), b + (bDiff * (y / splatterImage.height)), splatterPixel[3]);
                    // zet een punt neer op de juiste x en y
                    point(startOnShirtX + shirtX + x, startOnShirtY + shirtY + y);
                }
            }
        }
    }
}

function majoritySplatterInShirt(startOnShirtX, startOnShirtY) {
    let splatterPixelsTotal = splatterImage.width * splatterImage.height,
        splatterPixelsInsideShirt = 0;

    // Roteer door alle pixels van splatterImage
    for (let y = 0; y < splatterImage.height; y++) {
        for (let x = 0; x < splatterImage.width; x++) {
            // Check of valt binnen de shirt
            if (splatterPixelInShirt(startOnShirtX + x, startOnShirtY + y)) {
                splatterPixelsInsideShirt++;
            }
        }
    }

    // Meer dan 80% binnen
    if (splatterPixelsInsideShirt / splatterPixelsTotal > 0.5)
        return true;

    return false;
}

function splatterPixelInShirt(splatterX, splatterY) {
    // Check of spletter pixel valt tussen de dimensies van de shirt
    if (!between(splatterX, 0, shirtWidth) || !between(splatterY, 0, shirtHeight)) {
        return false;
    }

    if (shirtImage.get(splatterX, splatterY)[3] > 10) {
        return false;
    }

    return true;
}

// functie van p5 die triggered bij window resize, dan resized ie de canvas
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Returned het nummer, tenizj het lager is dan minimum, returned het minimum, of hoger dan maximum, dan returend het maximum
function clamp(number, min, max) {
    if (number < min)
        return min;

    if (number > max)
        return max;

    return number;
}

// Checkt het nummer of het binnen de grenzen valt
function between(number, min, max) {
    if (number < min || number > max)
        return false;

    return true;
}
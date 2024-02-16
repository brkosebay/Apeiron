import { writeFileSync, unlinkSync } from 'fs'; // Import unlinkSync
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backgrounds = 5; // Number of different backgrounds

function getRandomBackground() {
    const index = Math.floor(Math.random() * backgrounds);
    return path.join(__dirname, `backgrounds/bg${index}.png`); // Path to the background images
}

async function generateMetadata(tokenID, mintPrice) {
    const outputDir = path.join(__dirname, '../nftImages'); // Update this to your output directory

    const background = await sharp(getRandomBackground()).resize(256, 256).toBuffer();

    const svg = `
        <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <image href="data:image/png;base64,${background.toString('base64')}" x="0" y="0" height="256" width="256"/>
            <text x="128" y="150" font-family="Arial" font-size="80" text-anchor="middle" fill="black">${tokenID}</text>
        </svg>
    `;

    const fileName = `${tokenID}.svg`;
    const svgFilePath = path.join(outputDir, fileName);
    writeFileSync(svgFilePath, svg);

    const img = await sharp(svgFilePath);
    const resized = await img.resize(1024);
    await resized.toFile(path.join(outputDir, `${tokenID}.png`));

    unlinkSync(svgFilePath); // Delete the SVG file

    const meta = {
        name: `NFT #${tokenID}`,
        description: `Description for NFT #${tokenID}`,
        image: `http://localhost:5000/images/${tokenID}.png`,
        attributes: [
            {
                trait_type: "Rank",
                value: tokenID
            },
            {
                trait_type: "Times Traded",
                value: 0
            },
            {
                trait_type: "All Time High",
                value: mintPrice
            },
            {
                trait_type: "Points",
                value: 0
            }
        ]
    };

    return meta;
}

export default generateMetadata;

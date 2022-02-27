import { precalculate } from "modular-voronoi";
import { getBiomeColors } from "./biomes";
import { szudzik, lcg } from "../../../utils/deterministic.js"

export const generateShape = (chunkX, chunkY, size) => {

    const sideLength = (2 * size + 1);
    const prefixX = -size + chunkX * sideLength;
    const prefixY = -size + chunkY * sideLength;

    const points = new Array(Math.pow((sideLength + 2), 2));
    const colors = [];
    for (let i = 0; i <= sideLength + 1; i++) {
        for (let j = 0; j <= sideLength + 1; j++) {
            const x = prefixX + i - 1;
            const y = prefixY + j - 1;
            const id = szudzik(x, y);
            const output = lcg(id, 2);
            if (i !== 0 && j !== 0
                && i !== sideLength && j !== sideLength)
                colors.push(getBiomeColors(x, y));
            const positionedX = (i - 1 + (10 + (output % 81)) / 100) / sideLength;
            const positionedY = (j - 1 + (10 + (lcg(output, 2) % 81)) / 100) / sideLength;
            points[i + j * (sideLength + 2)] = [positionedX, positionedY];
        }
    }
    const voronoi = precalculate(points, 2 * size + 3, 2 * size + 3);
    postMessage({ shape: voronoi, colors: colors });
}
function generateSphereVertices(radius = 1, detail = 1) {
    const vertices = [];
    
    const latitudeBands = 8 * detail;
    const longitudeBands = 8 * detail;

    for (let lat = 0; lat < latitudeBands; lat++) {
        const theta1 = lat * Math.PI / latitudeBands;
        const theta2 = (lat + 1) * Math.PI / latitudeBands;

        const sin1 = Math.sin(theta1), cos1 = Math.cos(theta1);
        const sin2 = Math.sin(theta2), cos2 = Math.cos(theta2);

        for (let lon = 0; lon < longitudeBands; lon++) {
            const phi1 = lon * 2 * Math.PI / longitudeBands;
            const phi2 = (lon + 1) * 2 * Math.PI / longitudeBands;

            const sinp1 = Math.sin(phi1), cosp1 = Math.cos(phi1);
            const sinp2 = Math.sin(phi2), cosp2 = Math.cos(phi2);

            const v1 = [radius * cosp1 * sin1, radius * cos1, radius * sinp1 * sin1];
            const v2 = [radius * cosp1 * sin2, radius * cos2, radius * sinp1 * sin2];
            const v3 = [radius * cosp2 * sin2, radius * cos2, radius * sinp2 * sin2];
            const v4 = [radius * cosp2 * sin1, radius * cos1, radius * sinp2 * sin1];

            // Triangle 1
            vertices.push(...v1, ...v3, ...v2);

            // Triangle 2
            vertices.push(...v1, ...v4, ...v3);
        }
    }

    return vertices;
}
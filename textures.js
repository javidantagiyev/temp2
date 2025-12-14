// Utility helpers for loading PNG textures for the galaxy, player, and enemies.
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Placeholder pixel while image loads
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 255, 255, 255]));

    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    image.src = url;

    return texture;
}

function loadCubemap(gl, path) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faces = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: path },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: path },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: path },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: path },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: path },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: path }
    ];

    faces.forEach(face => {
        const img = new Image();
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        };
        img.src = face.url;
    });

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    return texture;
}


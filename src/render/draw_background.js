// @flow

const pattern = require('./pattern');
const StencilMode = require('../gl/stencil_mode');
const DepthMode = require('../gl/depth_mode');
const {backgroundUniformValues, backgroundPatternUniformValues} = require('./program/background_program');

import type Painter from './painter';
import type SourceCache from '../source/source_cache';
import type BackgroundStyleLayer from '../style/style_layer/background_style_layer';

module.exports = drawBackground;

function drawBackground(painter: Painter, sourceCache: SourceCache, layer: BackgroundStyleLayer) {
    const color = layer.paint.get('background-color');
    const opacity = layer.paint.get('background-opacity');

    if (opacity === 0) return;

    const context = painter.context;
    const gl = context.gl;
    const transform = painter.transform;
    const tileSize = transform.tileSize;
    const image = layer.paint.get('background-pattern');

    const pass = (!image && color.a === 1 && opacity === 1) ? 'opaque' : 'translucent';
    if (painter.renderPass !== pass) return;

    context.setStencilMode(StencilMode.disabled);
    context.setDepthMode(painter.depthModeForSublayer(0, pass === 'opaque' ? DepthMode.ReadWrite : DepthMode.ReadOnly));
    context.setColorMode(painter.colorModeForRenderPass());

    let program;
    if (image) {
        if (pattern.isPatternMissing(image, painter)) return;
        program = painter.useProgram('backgroundPattern');
        // program.fixedUniforms.set(program.uniforms, pattern.prepare(image, painter, program);
        painter.tileExtentPatternVAO.bind(context, program, painter.tileExtentBuffer, []);
    } else {
        program = painter.useProgram('background');
        // program.fixedUniforms.set(program.uniforms, {
        //     'u_color': [color.r, color.g, color.b, color.a]
        // });
        // TODO eventually we'll want to be able to draw arrays in program.draw as well
        // refactor this later
        painter.tileExtentVAO.bind(context, program, painter.tileExtentBuffer, []);
    }

    program.fixedUniforms.set(program.uniforms, {
        'u_opacity': opacity
    });
    const tileIDs = transform.coveringTiles({tileSize});

    for (const tileID of tileIDs) {
        const matrix = painter.transform.calculatePosMatrix(tileID.toUnwrapped());
        if (image) {
            program.fixedUniforms.set(program.uniforms, backgroundPatternUniformValues(matrix, opacity, painter, image, {tileID, tileSize}));
        } else {
            program.fixedUniforms.set(program.uniforms, backgroundUniformValues(matrix, opacity, color));   // TODO should these take painter + tileID args rather than calculating the pos matrix here? probably
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, painter.tileExtentBuffer.length);
    }
}

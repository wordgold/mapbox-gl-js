// @flow

const {patternUniforms} = require('./pattern');
const {
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');
const pattern = require('../pattern');
const util = require('../../util/util');

import type Context from '../../gl/context';
import type {UniformValues} from '../uniform_binding';

const fillUniforms = (context: Context) => {
    return new Uniforms({
        'u_matrix': new UniformMatrix4fv(context),
    });
};

const fillPatternUniforms = (context: Context) => {
    return fillUniforms(context)
        .concatenate(patternUniforms(context));
};

const fillOutlineUniforms = (context: Context) => {
    return fillUniforms(context)
        .concatenate(new Uniforms({
            'u_world': new Uniform2fv(context)
        }));
};

function fillUniformValues(matrix: Float32Array): UniformValues {       // TODO is this just unnecessary fn overhead ?
    return {
        'u_matrix': matrix
    };
}

function fillPatternUniformValues(matrix: Float32Array, painter: Painter, coord: OverscaledTileID, image: CrossFaded<string>, tile: {tileID: OverscaledTileID, tileSize: number}): UniformValues {
    return util.extend(fillUniformValues(matrix),
        pattern.prepare(image, painter),
        // TODO wondering if this will be a perf hit we don't want (setting the non-tile-specific pattern uniforms -- .prepare -- on each tile)
        pattern.setTile(tile, painter));
    // TODO check this
}


module.exports = { fillUniforms, fillPatternUniforms, fillOutlineUniforms, fillUniformValues, fillPatternUniformValues };

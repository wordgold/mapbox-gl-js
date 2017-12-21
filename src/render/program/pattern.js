// @flow

const {
    UniformScalar,
    UniformVector,
    Uniforms
} = require('../uniform_binding');

import type Program from '../program';
import type Context from '../../gl/context';

export type PatternUniforms = {|
    'u_image': UniformScalar,
    'u_pattern_tl_a': UniformVector,
    'u_pattern_br_a': UniformVector,
    'u_pattern_tl_b': UniformVector,
    'u_pattern_br_b': UniformVector,
    'u_texsize': UniformVector,
    'u_mix': UniformScalar,
    'u_pattern_size_a': UniformVector,
    'u_pattern_size_b': UniformVector,
    'u_scale_a': UniformScalar,
    'u_scale_b': UniformScalar,
    'u_pixel_coord_upper': UniformVector,
    'u_pixel_coord_lower': UniformVector,
    'u_tile_units_to_pixels': UniformScalar
|};

const patternUniforms = (context: Context, dynamicBinders: any, locations: {[key: string]: WebGLUniformLocation}) => {
    return new Uniforms({
        'u_image': new UniformScalar('i', context, locations.u_image),
        'u_pattern_tl_a': new UniformVector(2, context, locations.u_pattern_tl_a),
        'u_pattern_br_a': new UniformVector(2, context, locations.u_pattern_br_a),
        'u_pattern_tl_b': new UniformVector(2, context, locations.u_pattern_tl_b),
        'u_pattern_br_b': new UniformVector(2, context, locations.u_pattern_br_b),
        'u_texsize': new UniformVector(2, context, locations.u_texsize),
        'u_mix': new UniformScalar('f', context, locations.u_mix),
        'u_pattern_size_a': new UniformVector(2, context, locations.u_pattern_size_a),
        'u_pattern_size_b': new UniformVector(2, context, locations.u_pattern_size_b),
        'u_scale_a': new UniformScalar('f', context, locations.u_scale_a),
        'u_scale_b': new UniformScalar('f', context, locations.u_scale_b),
        'u_pixel_coord_upper': new UniformVector(2, context, locations.u_pixel_coord_upper),
        'u_pixel_coord_lower': new UniformVector(2, context, locations.u_pixel_coord_lower),
        'u_tile_units_to_pixels': new UniformScalar('f', context, locations.u_tile_units_to_pixels)
    });
}

module.exports = { patternUniforms };

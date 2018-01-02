// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniforms
} = require('../uniform_binding');

import type Program from '../program';
import type Context from '../../gl/context';

export type PatternUniforms = {|
    'u_image': Uniform1i,
    'u_pattern_tl_a': Uniform2fv,
    'u_pattern_br_a': Uniform2fv,
    'u_pattern_tl_b': Uniform2fv,
    'u_pattern_br_b': Uniform2fv,
    'u_texsize': Uniform2fv,
    'u_mix': UniformScalar,
    'u_pattern_size_a': Uniform2fv,
    'u_pattern_size_b': Uniform2fv,
    'u_scale_a': Uniform1f,
    'u_scale_b': Uniform1f,
    'u_pixel_coord_upper': Uniform2fv,
    'u_pixel_coord_lower': Uniform2fv,
    'u_tile_units_to_pixels': Uniform1f
|};

const patternUniforms = (context: Context, dynamicBinders: any, locations: {[key: string]: WebGLUniformLocation}) => {
    return new Uniforms({
        'u_image': new Uniform1i(context, locations.u_image),
        'u_pattern_tl_a': new Uniform2fv(context, locations.u_pattern_tl_a),
        'u_pattern_br_a': new Uniform2fv(context, locations.u_pattern_br_a),
        'u_pattern_tl_b': new Uniform2fv(context, locations.u_pattern_tl_b),
        'u_pattern_br_b': new Uniform2fv(context, locations.u_pattern_br_b),
        'u_texsize': new Uniform2fv(context, locations.u_texsize),
        'u_mix': new UniformScalar(context, locations.u_mix),
        'u_pattern_size_a': new Uniform2fv(context, locations.u_pattern_size_a),
        'u_pattern_size_b': new Uniform2fv(context, locations.u_pattern_size_b),
        'u_scale_a': new Uniform1f(context, locations.u_scale_a),
        'u_scale_b': new Uniform1f(context, locations.u_scale_b),
        'u_pixel_coord_upper': new Uniform2fv(context, locations.u_pixel_coord_upper),
        'u_pixel_coord_lower': new Uniform2fv(context, locations.u_pixel_coord_lower),
        'u_tile_units_to_pixels': new Uniform1f(context, locations.u_tile_units_to_pixels)
    });
}

module.exports = { patternUniforms };

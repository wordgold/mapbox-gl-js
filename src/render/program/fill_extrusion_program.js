// @flow

const {patternUniforms} = require('./pattern');
const {
    UniformScalar,
    UniformVector,
    UniformMatrix,
    Uniforms
} = require('../uniform_binding');

// import type PatternUniforms from './pattern';
import type Program from '../program';
import type Context from '../../gl/context';

type PatternUniforms = {|                       // TODO for some reason this only works in FillExtrusionPatternUniforms when I inline it here — bug; investigate
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
    'u_pixel_coord_lower': UniformVector
|};

export type FillExtrusionUniforms = {|
    'u_matrix': UniformMatrix,
    'u_lightpos': UniformVector,
    'u_lightintensity': UniformScalar,
    'u_lightcolor': UniformVector,
|};

export type FillExtrusionPatternUniforms = {|
    ...FillExtrusionUniforms,
    ...PatternUniforms,
    'u_height_factor': UniformScalar<'f'>,
|};

const fillExtrusionUniforms = (context: Context, dynamicBinders: any, locations: {[key: string]: WebGLUniformLocation}) => {
    // console.log(dynamicBinders)
    return new Uniforms({
        'u_matrix': new UniformMatrix(4, context, locations.u_matrix),
        'u_lightpos': new UniformVector(3, context, locations.u_lightpos),
        'u_lightintensity': new UniformScalar('f', context, locations.u_lightintensity),
        'u_lightcolor': new UniformVector(3, context, locations.u_lightcolor)
    });
}

const fillExtrusionPatternUniforms = (context: Context, dynamicBinders: any, locations: {[key: string]: WebGLUniformLocation}) => {
    return fillExtrusionUniforms(context, dynamicBinders, locations)
        .concatenate(patternUniforms(context, dynamicBinders, locations))
        .concatenate(new Uniforms({
            'u_height_factor': new UniformScalar('f', context, locations.u_height_factor)
    }));
}


module.exports = { fillExtrusionUniforms, fillExtrusionPatternUniforms };

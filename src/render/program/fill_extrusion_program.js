// @flow

// const {patternUniforms} = require('./pattern');
const {
    UniformScalar,
    UniformVector,
    UniformMatrix,
    Uniforms
} = require('../uniform_binding');

// import type PatternUniforms from './pattern';
import type Program from '../program';

export type FillExtrusionUniforms = {|
    'u_matrix': UniformMatrix<4>,
    'u_lightpos': UniformVector<3>,
    'u_lightintensity': UniformScalar<'f'>,
    'u_lightcolor': UniformVector<3>,
|};

// export type FillExtrusionPatternUniforms = {|
//     ...FillExtrusionUniforms,
//     ...PatternUniforms,
//     'u_height_factor': UniformScalar<'f'>,
// |};


const fillExtrusionUniforms = (context: Context, dynamicBinders: any, locations: {[key: string]: WebGLUniformLocation}) => {
    console.log(dynamicBinders)
    return new Uniforms({
        'u_matrix': new UniformMatrix(4, context, locations.u_matrix),
        'u_lightpos': new UniformVector(3, context, locations.u_lightpos),
        'u_lightintensity': new UniformScalar('f', context, locations.u_lightintensity),
        'u_lightcolor': new UniformVector(3, context, locations.u_lightcolor)
    });
}

// const fillExtrusionPatternUniforms = (context: Context, program: Program) => {
//     return {
//         ...fillExtrusionUniforms(context, program),
//         ...patternUniforms(context, program),
//         'u_height_factor': new UniformScalar(context, program.uniforms.u_height_factor, 'f')
//     }
// }


module.exports = { fillExtrusionUniforms/*, fillExtrusionPatternUniforms*/ };

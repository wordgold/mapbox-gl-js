// @flow

const {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    UniformMatrix4fv,
    Uniforms
} = require('../uniform_binding');

import type Context from '../../gl/context';
import type Painter from '../painter';
import type {UniformValues} from '../uniform_binding';

function circleUniforms(context: Context): Uniforms {
    return new Uniforms({
        'u_camera_to_center_distance': new Uniform1f(context),
        'u_scale_with_map': new Uniform1i(context),
        'u_pitch_with_map': new Uniform1i(context),
        'u_extrude_scale': new Uniform2fv(context),
        'u_pitch_with_map': new Uniform1i(context),
        'u_extrude_scale': new Uniform2fv(context),
        'u_matrix': new UniformMatrix4fv(context)
    });
};

function circleUniformValues(matrix: Float32Array, painter: Painter, scaleWithMap: boolean, pitchWithMap: boolean, extrudeScale: Array<number>): UniformValues {
    return {
        u_camera_to_center_distance: painter.transform.cameraToCenterDistance,
        u_scale_with_map: Number(scaleWithMap),
        u_matrix: matrix,
        u_pitch_with_map: Number(pitchWithMap),
        u_extrude_scale: extrudeScale
    };
}

module.exports = { circleUniforms, circleUniformValues };

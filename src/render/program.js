// @flow

const browser = require('../util/browser');
const shaders = require('../shaders');
const assert = require('assert');
const {ProgramConfiguration} = require('../data/program_configuration');
const VertexArrayObject = require('./vertex_array_object');
const Context = require('../gl/context');
const util = require('../util/util');
const {Uniforms, Uniform1f, Uniform4fv} = require('./uniform_binding');

import type {SegmentVector} from '../data/segment';
import type VertexBuffer from '../gl/vertex_buffer';
import type IndexBuffer from '../gl/index_buffer';
import type DepthMode from '../gl/depth_mode';
import type StencilMode from '../gl/stencil_mode';
import type ColorMode from '../gl/color_mode';
import type {PossiblyEvaluated, PossiblyEvaluatedPropertyValue} from '../style/properties';
import type {UniformValues, UniformLocations} from './uniform_binding';

export type DrawMode =
    | $PropertyType<WebGLRenderingContext, 'LINES'>
    | $PropertyType<WebGLRenderingContext, 'TRIANGLES'>;

class Program {
    program: WebGLProgram;
    uniforms: UniformLocations;
    attributes: {[string]: number};
    numAttributes: number;
    staticUniforms: Uniforms;
    dynamicUniforms: Uniforms;
    configuration: ProgramConfiguration;

    constructor(context: Context,
                source: {fragmentSource: string, vertexSource: string},
                configuration: ProgramConfiguration,
                staticUniforms: (Context) => Uniforms,
                showOverdrawInspector: boolean) {
        const gl = context.gl;
        this.program = gl.createProgram();
        this.configuration = configuration;         // TODO will this be a problem to store it or no?

        const defines = configuration.defines().concat(
            `#define DEVICE_PIXEL_RATIO ${browser.devicePixelRatio.toFixed(1)}`);
        if (showOverdrawInspector) {
            defines.push('#define OVERDRAW_INSPECTOR;');
        }

        const fragmentSource = defines.concat(shaders.prelude.fragmentSource, source.fragmentSource).join('\n');
        const vertexSource = defines.concat(shaders.prelude.vertexSource, source.vertexSource).join('\n');

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        assert(gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS), (gl.getShaderInfoLog(fragmentShader): any));
        gl.attachShader(this.program, fragmentShader);

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        assert(gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS), (gl.getShaderInfoLog(vertexShader): any));
        gl.attachShader(this.program, vertexShader);

        // Manually bind layout attributes in the order defined by their
        // ProgramInterface so that we don't dynamically link an unused
        // attribute at position 0, which can cause rendering to fail for an
        // entire layer (see #4607, #4728)
        const layoutAttributes = configuration.layoutAttributes || [];
        for (let i = 0; i < layoutAttributes.length; i++) {
            gl.bindAttribLocation(this.program, i, layoutAttributes[i].name);
        }

        gl.linkProgram(this.program);
        assert(gl.getProgramParameter(this.program, gl.LINK_STATUS), (gl.getProgramInfoLog(this.program): any));

        this.numAttributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);

        this.attributes = {};
        this.uniforms = {};

        for (let i = 0; i < this.numAttributes; i++) {
            const attribute = gl.getActiveAttrib(this.program, i);
            if (attribute) {
                this.attributes[attribute.name] = gl.getAttribLocation(this.program, attribute.name);
            }
        }

        const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const uniform = gl.getActiveUniform(this.program, i);
            if (uniform) {
                this.uniforms[uniform.name] = gl.getUniformLocation(this.program, uniform.name);
            }
        }

        this.dynamicUniforms = new Uniforms(util.mapObject(configuration.getUniformBindings(),
            (components) => components === 4 ? new Uniform4fv(context) : new Uniform1f(context)));

        this.staticUniforms = staticUniforms(context);
            // .concatenate(new Uniforms(util.mapObject(configuration.getUniformBindings(), (components) =>
            //     components === 4 ? new Uniform4fv(context) : new Uniform1f(context)
            // )));
    }

    draw(context: Context,
         drawMode: DrawMode,
         layerID: string,
         layoutVertexBuffer: VertexBuffer,
         indexBuffer: IndexBuffer,
         segments: SegmentVector,
         configuration: ?ProgramConfiguration,
         dynamicLayoutBuffer: ?VertexBuffer,
         dynamicLayoutBuffer2: ?VertexBuffer) {

        const gl = context.gl;

        const primitiveSize = {
            [gl.LINES]: 2,
            [gl.TRIANGLES]: 3
        }[drawMode];

        for (const segment of segments.get()) {
            const vaos = segment.vaos || (segment.vaos = {});
            const vao: VertexArrayObject = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());

            vao.bind(
                context,
                this,
                layoutVertexBuffer,
                configuration ? configuration.getPaintVertexBuffers() : [],
                indexBuffer,
                segment.vertexOffset,
                dynamicLayoutBuffer,
                dynamicLayoutBuffer2
            );

            gl.drawElements(
                drawMode,
                segment.primitiveLength * primitiveSize,
                gl.UNSIGNED_SHORT,
                segment.primitiveOffset * primitiveSize * 2);
        }
    }

    _draw(context: Context,
         drawMode: DrawMode,
         depthMode: DepthMode | $ReadOnly<DepthMode>,
         stencilMode: StencilMode | $ReadOnly<StencilMode>,     // TODO this seems weird
         colorMode: ColorMode | $ReadOnly<ColorMode>,
         uniformValues: UniformValues,
         layerID: string,
         layoutVertexBuffer: VertexBuffer,
         indexBuffer: IndexBuffer,
         segments: SegmentVector,
         // paint prop binders, ?? or just use from ProgramConfiguration
         currentProperties: any,
         zoom: number,
         first: boolean,            // note: unfortunately it seems like this does make a perf difference
         configuration: ?ProgramConfiguration,
         dynamicLayoutBuffer: ?VertexBuffer,
         dynamicLayoutBuffer2: ?VertexBuffer) {

        const gl = context.gl;

        context.setDepthMode(depthMode);
        context.setStencilMode(stencilMode);
        context.setColorMode(colorMode);

        // TODO probably concatenate these?
        this.staticUniforms.set(this.uniforms, uniformValues);
        if (first) {
            this.dynamicUniforms.set(this.uniforms, this.configuration.getUniforms(currentProperties, {zoom: zoom}));
        }

        const primitiveSize = {
            [gl.LINES]: 2,
            [gl.TRIANGLES]: 3
        }[drawMode];

        for (const segment of segments.get()) {
            const vaos = segment.vaos || (segment.vaos = {});
            const vao: VertexArrayObject = vaos[layerID] || (vaos[layerID] = new VertexArrayObject());

            vao.bind(
                context,
                this,
                layoutVertexBuffer,
                configuration ? configuration.getPaintVertexBuffers() : [],     // TODO can we remove from args and use this.config, or are there special cases i am not considering?
                        // in theory (or in code) different buckets (tiles) from the same layer could have diff configs, but i dont' see how this would happen in practice -- ?
                indexBuffer,
                segment.vertexOffset,
                dynamicLayoutBuffer,
                dynamicLayoutBuffer2
            );

            gl.drawElements(
                drawMode,
                segment.primitiveLength * primitiveSize,
                gl.UNSIGNED_SHORT,
                segment.primitiveOffset * primitiveSize * 2);
        }
    }
}

module.exports = Program;

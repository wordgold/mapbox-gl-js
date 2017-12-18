// @flow

const util = require('../util/util');

import type Context from '../gl/context';

export interface UniformInterface<T> {
    context: Context;
    set(value: T): void;
    _set(value: T): void;
}

type Components = 1 | 2 | 3 | 4;
type UType = 'f' | 'i';

class Uniform<T> {
    context: Context;
    location: WebGLUniformLocation;
    current: T;
    modifier: Components | UType;

    constructor(modifier: Components | UType, context: Context, location: WebGLUniformLocation) {
        this.modifier = modifier;
        this.context = context;
        this.location = location;
    }

    set(v: T) {
        if (!util.deepEqual(this.current, v)) {
            this.current = v;
            this._set(v);
        }
    }

    _set(v: T) {}
}

class UniformScalar extends Uniform<number> implements UniformInterface<number> {
    _set(v: number): void {
        switch (this.modifier) {
            case 'i':
                this.context.gl.uniform1i(this.location, v);
                break;
            case 'f':
                this.context.gl.uniform1f(this.location, v);
                break;
            default: break;
        }
    }
}

class UniformVector extends Uniform<Array<number>> implements UniformInterface<Array<number>> {
    _set(v: Array<number>): void {
        switch (this.modifier) {
            case 2:
                this.context.gl.uniform2fv(this.location, v);
                break;
            case 3:
                this.context.gl.uniform3fv(this.location, v);
                break;
            case 4:
                this.context.gl.uniform4fv(this.location, v);
                break;
            default: break;
        }
    }
}

class UniformMatrix extends Uniform<Float32Array> implements UniformInterface<Float32Array> {
    _set(v: Float32Array): void {
        this.context.gl.uniformMatrix4fv(this.location, false, v);
    }
}

class Uniforms {
    bindings: Object;    // TODO type better

    constructor(bindings: Object) {
        this.bindings = bindings;
    }

    set(uniformValues: Object) {
        for (const name in uniformValues) {
            this.bindings[name].set(uniformValues[name]);
        }
    }

    concatenate(otherUniforms: Object) {
        // TODO
    }

    // maybe also individual set accessor?
}


module.exports = {
    UniformScalar,
    UniformVector,
    UniformMatrix,
    Uniforms
};

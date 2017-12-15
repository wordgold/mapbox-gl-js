// @flow


const {ContextValue} = require('../gl/value');
const util = require('../util/util');

export interface UniformInterface<T> {
    context: Context;
    set(value: T): void;
    _set(value: T): void;
}

type Components = 1 | 2 | 3 | 4;
type UType = 'f' | 'i';

class Uniform<C, T> {
    context: Context;
    location: WebGLUniformLocation;
    current: any;   // TODO
    components: Components;
    type: UType;

    constructor(modifier: Components | UType, context: Context, location: WebGLUniformLocation) {
        console.log('construct');
        this.modifier = modifier;
        this.context = context;
        this.location = location;
    }

    set(/**/) {
        if (!util.deepEqual(this.current, v)) {
            this.current = v;
            this._set(v);
        }
    }
}

class UniformScalar<T> extends Uniform<1, T> implements UniformInterface<1, T> {
    components: 1;

    set(v: any): void {
        this.context.gl[`uniform1${this.modifier}`](this.location, v);
    }
}

class UniformVector<C> extends Uniform<C, 'f'> implements UniformInterface<C, 'f'> {
    type: 'f';

    set(v: any): void {
        this.context.gl[`uniform${this.modifier}fv`](this.location, v);
    }
}

class UniformMatrix<C> extends Uniform<C, 'f'> implements UniformInterface<C, 'f'> {
    type: 'f';

    set(v: any): void {
        this.context.gl[`uniformMatrix${this.modifier}fv`](this.location, false, v);
    }
}

// export type UniformBindings = any;  // TODO

class Uniforms {
    // bindings: Object;    // TODO type better

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

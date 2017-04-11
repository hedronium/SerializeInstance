export interface SerialObjectInterface {
    p?: string;
    e?: string;
    obj: {
        [key: string]: any;
    };
}

export type ExportMapType = WeakMap<Object, {
    path: string;
    export: string;
}>;

export type SupportMapType = WeakMap<Object,  [
        (obj: Object) => any,
        (obj: Object) => Object
]>;

export type NonSupportType = WeakSet<Object>;

export enum Process {in, out};

export class Serializer {
    static export_map: ExportMapType;
    static support_map: SupportMapType;
    static non_support: NonSupportType;

    static static_to_obj: {
        [key: string]: Object
    } = {
        'date': Date,
        'buf': Buffer,
        'regex': RegExp
    };

    static bootstrap() {
        if (Serializer.export_map) {
            return;
        }

        Serializer.export_map = new WeakMap;
        Serializer.support_map = new WeakMap;
        Serializer.non_support = new WeakSet;

        Serializer.non_support.add(Function);
        Serializer.non_support.add(Map);
        Serializer.non_support.add(WeakMap);
        Serializer.non_support.add(Set);
        Serializer.non_support.add(WeakSet);
        Serializer.non_support.add(Promise);

        Serializer.support_map.set(Date, [(obj: Date) => {
            return {
                n: 'date',
                data: obj.getTime()
            };
        }, (obj: Object): Date => {
            return new Date((<any>obj).data);
        }]);

        Serializer.support_map.set(Buffer, [(obj: Buffer) => {
            return {
                n: 'buf',
                data: obj.toString('hex')
            };
        }, (obj: Object): Buffer => {
            return Buffer.from((<any>obj).data, 'hex');
        }]);

        Serializer.support_map.set(RegExp, [(obj: RegExp) => {
            return {
                n: 'regex',
                data: obj.toString()
            };
        }, (obj: Object): RegExp => {
            let data: string = (<any>obj).data;
            let flags: string = data.split('/').pop();
            let pattern: string = data.substr(1, data.length - flags.length - 2);

            return new RegExp(pattern, flags);
        }]);

        Object.keys(require.cache).forEach((cache_key: string) => {
            let module = require.cache[cache_key];

            for (let exp in module.exports) {
                let exp_obj = module.exports[exp];

                if (!(exp_obj instanceof Object)) {
                    continue;
                }

                Serializer.export_map.set(exp_obj, {
                    export: exp,
                    path: module.id
                });
            }
        });
    }

    static serialize(data: any): any {
        Serializer.bootstrap();

        if (data instanceof Array) {

            return data.map((element) => {
                return Serializer.serialize(element);
            });

        } else if (Serializer.support_map.has(data.constructor)) {

            return Serializer.support_map.get(data.constructor)[Process.in](data);

        } else if (Serializer.non_support.has(data.constructor) || typeof data === 'symbol') {

            return;

        } else if (data instanceof Object) {
            let ret: SerialObjectInterface = {
                obj: {}
            };

            let props;

            if (data.__serialSleep__ instanceof Function) {
                props = data.__serialSleep__();
            }

            (props || Object.getOwnPropertyNames(data)).forEach((key: string) => {
                let prop = data[key];
                ret.obj[key] = Serializer.serialize(prop);
            });

            if (Serializer.export_map.has(data.constructor)) {
                let exported = Serializer.export_map.get(data.constructor);
                ret.p = exported.path;
                ret.e = exported.export;
            }

            return ret;

        } else {

            return data;

        }
    }

    static unserialize(data: any): any {
        Serializer.bootstrap();

        if (data instanceof Array) {
            
            return data.map((element) => {
                return Serializer.unserialize(element);
            });

        } else if ((data instanceof Object) && ('n' in data)) {
            
            let obj = Serializer.static_to_obj[data.n];
            return Serializer.support_map.get(obj)[Process.out](data);

        } else if ((data instanceof Object) && ('p' in data) && ('e' in data)) {
            let file_exports;
            let constructor;

            try {
                file_exports = require(data.p);
            } catch (e) {
                throw new Error('Path no longer exists');
            }

            if (!(data.e in file_exports)) {
                throw new Error('Export no longer exists.');
            }

            constructor = file_exports[data.e];
            let obj = Object.create(constructor.prototype);

            Object.getOwnPropertyNames(data.obj).forEach((key: string) => {
                let prop = data.obj[key];
                obj[key] = Serializer.unserialize(prop);
            });

            return obj;
        } else if (data instanceof Object) {
            let obj: any = {};

            Object.getOwnPropertyNames(data.obj).forEach((key: string) => {
                let prop = data.obj[key];
                obj[key] = Serializer.unserialize(prop);
            });

            return obj;
        } else {
            return data;
        }
    }
}
import { type PermissionKey } from '../permissions';
export declare const Auth: (...permissions: PermissionKey[]) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;

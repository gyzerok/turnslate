"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePlaceable = exports.parseElements = void 0;
var parseElements = function (elements) {
    var identifiers = [];
    for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
        var element = elements_1[_i];
        switch (element.type) {
            case 'Placeable':
                identifiers = identifiers.concat(exports.parsePlaceable(element));
                break;
            default:
                break;
        }
    }
    return identifiers;
};
exports.parseElements = parseElements;
var parsePlaceable = function (element) {
    switch (element.expression.type) {
        case 'VariableReference': {
            var expression = element.expression;
            return expression.id.name;
        }
        case 'MessageReference': {
            throw new Error('MessageReference is not supported by the system');
        }
        case 'SelectExpression': {
            var expression = element.expression;
            var selectorVariableReference = expression.selector;
            var identifiers = [];
            for (var _i = 0, _a = expression.variants; _i < _a.length; _i++) {
                var variant = _a[_i];
                identifiers = identifiers.concat(exports.parseElements(variant.value.elements));
            }
            return __spreadArray([selectorVariableReference.id.name], identifiers);
        }
        default:
            return [];
    }
};
exports.parsePlaceable = parsePlaceable;

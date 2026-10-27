import test from 'node:test';
import assert from 'node:assert/strict';
import { search } from './public/search.js';
test('devuelve evidencia para la consulta de ejemplo', () => assert.equal(search('decisiones del proyecto')[0].path, 'proyecto/decisiones.md'));
test('no inventa resultados y admite acentos', () => { assert.equal(search('astronautas').length, 0); assert.equal(search('sincronizacion')[0].path, 'reuniones/primera-reunion.md'); });
test('consulta vacía no devuelve resultados', () => assert.deepEqual(search('de la'), []));

const { suma } = require('../core/reservas');

test('suma 2 + 3 es 5', () => {
  expect(suma(2, 3)).toBe(5);
});
import { defineConfig } from 'vitest/config';
// web-এর pure logic util (checker ইত্যাদি) test — DOM ছাড়াই node environment যথেষ্ট
export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});

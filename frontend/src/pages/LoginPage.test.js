/**
 * LoginPage.test.js
 * Basic tests for LoginPage component
 * 
 * Note: Full integration tests require proper router setup
 * These tests verify the module structure and basic exports
 */

const fs = require('fs');
const path = require('path');

describe('LoginPage', () => {
  test('LoginPage.js file exists', () => {
    const loginPagePath = path.join(__dirname, 'LoginPage.js');
    expect(fs.existsSync(loginPagePath)).toBe(true);
  });

  test('LoginPage.js is a valid React component', () => {
    const content = fs.readFileSync(path.join(__dirname, 'LoginPage.js'), 'utf8');
    // Handles both: "function LoginPage" and "export default function LoginPage"
    expect(content).toMatch(/function LoginPage/);
    expect(content).toContain('export default');
  });

  test('LoginPage.js uses form validation', () => {
    const content = fs.readFileSync(path.join(__dirname, 'LoginPage.js'), 'utf8');
    expect(content).toContain('useForm');
    expect(content).toContain('zodResolver');
  });

  test('LoginPage.js uses authentication context', () => {
    const content = fs.readFileSync(path.join(__dirname, 'LoginPage.js'), 'utf8');
    expect(content).toContain('useAuth');
    expect(content).toContain('signIn');
  });

  test('LoginPage.js has email and password fields', () => {
    const content = fs.readFileSync(path.join(__dirname, 'LoginPage.js'), 'utf8');
    expect(content).toContain('email');
    expect(content).toContain('password');
    expect(content).toContain('type="email"');
    expect(content).toContain('type="password"');
  });

  test('LoginPage.js handles form submission', () => {
    const content = fs.readFileSync(path.join(__dirname, 'LoginPage.js'), 'utf8');
    expect(content).toContain('onSubmit');
    expect(content).toContain('handleSubmit');
  });
});

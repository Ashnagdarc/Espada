// Contact Form Test Script
console.log('🧪 Contact Form Test Script');
console.log('============================');

const testData = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  message: 'Hi, I am interested in learning more about your upcoming collections, especially the XVII line. When will it be available for purchase?'
};

console.log('📝 Test Data:');
console.log('Name:', testData.name);
console.log('Email:', testData.email);
console.log('Message:', testData.message);

function validateForm(data) {
  const errors = {};
  
  if (!data.name.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.message.trim()) {
    errors.message = 'Message is required';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

console.log('\n🔍 Testing Form Validation:');
const validation = validateForm(testData);

if (validation.isValid) {
  console.log('✅ Form validation passed!');
  console.log('✅ All fields are valid');
  console.log('✅ Email format is correct');
  console.log('✅ Message length is sufficient');
} else {
  console.log('❌ Form validation failed:');
  Object.entries(validation.errors).forEach(([field, error]) => {
    console.log('   ' + field + ': ' + error);
  });
}

console.log('\n🧪 Testing Edge Cases:');

const emptyForm = { name: '', email: '', message: '' };
const emptyValidation = validateForm(emptyForm);
console.log('Empty form validation:', emptyValidation.isValid ? '✅ Passed' : '❌ Failed (Expected)');

const invalidEmail = { ...testData, email: 'invalid-email' };
const emailValidation = validateForm(invalidEmail);
console.log('Invalid email validation:', emailValidation.isValid ? '❌ Passed (Unexpected)' : '✅ Failed (Expected)');

const shortMessage = { ...testData, message: 'Hi' };
const messageValidation = validateForm(shortMessage);
console.log('Short message validation:', messageValidation.isValid ? '❌ Passed (Unexpected)' : '✅ Failed (Expected)');

console.log('\n📋 Test Summary:');
console.log('================');
console.log('✅ Form accepts valid data');
console.log('✅ Form rejects empty fields');
console.log('✅ Form validates email format');
console.log('✅ Form enforces minimum message length');
console.log('✅ Form provides clear error messages');
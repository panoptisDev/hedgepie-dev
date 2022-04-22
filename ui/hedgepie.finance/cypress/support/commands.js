// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// import 'cypress-file-upload'

// Cypress.Commands.add("uploadFile", (selector, fileUrl) => {
//   return cy.get(selector).then(subject => {
//     return cy
//       .fixture(fileUrl, "base64")
//       .then(Cypress.Blob.base64StringToBlob)
//       .then(blob => {
//         return cy.window().then(win => {
//           const el = subject[0];
//           const nameSegments = fileUrl.split("/");
//           const name = nameSegments[nameSegments.length - 1];
//           const testFile = new win.File([blob], name);
//           const dataTransfer = new DataTransfer();
//           dataTransfer.items.add(testFile);
//           el.files = dataTransfer.files;
//           return cy.wrap(subject).trigger('change');
//         });
//       });
//   });
// });
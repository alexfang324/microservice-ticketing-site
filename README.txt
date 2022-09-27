About this app:
This is a ticket selling e-commerce site that adopts a microservice architecture with asynchronized communication.
For simplicity, the app uses the same jwt secret to generate all jwt token and the secret is created as a kubernetes secret.
The payment is handled by Stripe API. User must add a "jwt-secret" and "stripe-secret" to the kubernetes secrets prior to starting the app


App Highlight:
    Structure:
    - microservice architecture with multiple node.js services
    - Next.js front end
    - remote kubernetes cluster on Google Cloud
    - asynchronize communication using NATS-streaming server
    - routing handled using Ingress-Nginx
    - Code reuse using self-published npm library

    Implementation:
    - input data checked using type annotation and interfaces
    - code tested using Jest, Jest mock object, and Postman
    - concurrency handled using counters
    - user authentication handled with jwt carried Cookie

   CI/CD:
    - used skaffold and GitHub Action
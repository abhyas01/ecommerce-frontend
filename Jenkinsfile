@Library('ecommerce-shared-lib') _

pipeline {
  agent any

  tools { nodejs 'node-20' }

  environment {
    SERVICE_NAME  = 'ecommerce-frontend'
    IMAGE_NAME    = '01abhyas/ecommerce-frontend'
    SONAR_PROJECT = 'ecommerce-frontend'
  }

  stages {

    stage('Prepare Version') {
      steps {
        script {
          def ver         = prepareVersion(packageJsonPath: 'package.json')
          env.DOCKER_TAG  = ver.DOCKER_TAG
          env.BRANCH_SAFE = ver.BRANCH_SAFE
        }
      }
    }

    stage('Install Dependencies') {
      steps { sh 'npm install' }
    }

    stage('Lint') {
      steps {
        dir('src') { sh 'npm run lint' }
      }
    }

    stage('Unit Test') {
      steps { sh 'npm run test:ci' }
      post {
        always {
          junit testResults: 'coverage/junit.xml', allowEmptyResults: true
        }
      }
    }

    stage('React Build') {
      steps { sh 'npm run build' }
    }

    stage('SonarQube Analysis') {
      steps {
        sonarAnalysis(projectKey: env.SONAR_PROJECT)
      }
    }

    stage('Container Build & Push') {
      when { not { changeRequest() } }
      steps {
        buildAndPushImage(
          imageName: env.IMAGE_NAME,
          dockerTag: env.DOCKER_TAG,
          context:   '.',
          target:    'production',
        )
      }
    }

    stage('E2E Test') {
      when {
        anyOf {
          branch 'develop'
          branch pattern: 'release/.*', comparator: 'REGEXP'
        }
      }
      steps {
        sh 'npx playwright install --with-deps chromium'
        sh """
          sed 's|abhyas01/ecommerce-frontend:latest|abhyas01/ecommerce-frontend:${env.DOCKER_TAG}|g' \
            docker-compose.test.yml > docker-compose.e2e.yml
        """

        sh 'docker compose -f docker-compose.e2e.yml up -d --wait'
        sh 'sleep 5'

        sh 'FRONTEND_URL=http://localhost:3000 npx playwright test'
      }
      post {
        always {
          sh 'docker compose -f docker-compose.e2e.yml down -v || true'
          sh 'rm -f docker-compose.e2e.yml'
          junit testResults: 'playwright-report/results.xml', allowEmptyResults: true
          archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
      }
    }

    stage('Deploy - Dev') {
      when { branch 'develop' }
      steps {
        deployToK8s(
          namespace:   'dev',
          serviceName: env.SERVICE_NAME,
          imageName:   env.IMAGE_NAME,
          dockerTag:   env.DOCKER_TAG,
        )
      }
    }

    stage('Deploy - Staging') {
      when { branch pattern: 'release/.*', comparator: 'REGEXP' }
      steps {
        deployToK8s(
          namespace:   'staging',
          serviceName: env.SERVICE_NAME,
          imageName:   env.IMAGE_NAME,
          dockerTag:   env.DOCKER_TAG,
        )
      }
    }

    stage('Approval - Prod') {
      when { branch 'main' }
      steps {
        timeout(time: 30, unit: 'MINUTES') {
          input(
            message:   "Deploy ${env.SERVICE_NAME}:${env.DOCKER_TAG} to PRODUCTION?",
            ok:        'Deploy',
            submitter: 'admin',
          )
        }
      }
    }

    stage('Deploy - Prod') {
      when { branch 'main' }
      steps {
        deployToK8s(
          namespace:   'prod',
          serviceName: env.SERVICE_NAME,
          imageName:   env.IMAGE_NAME,
          dockerTag:   env.DOCKER_TAG,
        )
      }
    }

    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'artifacts/**', fingerprint: true, allowEmptyArchive: true
      }
    }

  }

  post {
    always { cleanWs() }
  }
}
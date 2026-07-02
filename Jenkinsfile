pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Runtime') {
            steps {
                sh '''
                    set -eu
                    NODE_VERSION="$(node --version)"
                    NODE_MAJOR="${NODE_VERSION#v}"
                    NODE_MAJOR="${NODE_MAJOR%%.*}"
                    printf 'Node.js runtime: %s\n' "$NODE_VERSION"
                    if [ "$NODE_MAJOR" -ne 22 ]; then
                        printf 'Node.js 22 is required; found %s.\n' "$NODE_VERSION" >&2
                        exit 1
                    fi
                '''
            }
        }

        stage('Governance') {
            steps {
                sh 'npm ci'
                sh 'npm run validate:governance'
                sh 'npm run test:governance'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
                script {
                    if (fileExists('backend/gradlew')) {
                        sh 'chmod +x backend/gradlew && ./backend/gradlew -p backend test'
                    }
                    if (fileExists('frontend/package.json')) {
                        dir('frontend') {
                            sh 'npm ci && npm run typecheck && npm test'
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                script {
                    if (fileExists('backend/gradlew')) {
                        sh './backend/gradlew -p backend build -x test'
                    }
                    if (fileExists('frontend/package.json')) {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Integration') {
            when {
                expression { fileExists('backend/src/integrationTest') }
            }
            steps {
                sh './backend/gradlew -p backend integrationTest'
            }
        }

        stage('Image') {
            when {
                allOf {
                    anyOf {
                        branch 'dev'
                        branch 'main'
                    }
                    expression { fileExists('Dockerfile') }
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'container-registry',
                    usernameVariable: 'REGISTRY_USER',
                    passwordVariable: 'REGISTRY_PASSWORD'
                )]) {
                    sh '''
                        set +x
                        printf '%s' "$REGISTRY_PASSWORD" | docker login --username "$REGISTRY_USER" --password-stdin
                        docker build --tag "prompt-agent:${BUILD_NUMBER}" .
                    '''
                }
            }
        }

        stage('Staging') {
            when {
                allOf {
                    branch 'dev'
                    expression { fileExists('scripts/deploy-staging.sh') }
                }
            }
            steps {
                withCredentials([string(credentialsId: 'staging-deploy-token', variable: 'DEPLOY_TOKEN')]) {
                    sh '''
                        set +x
                        ./scripts/deploy-staging.sh "$DEPLOY_TOKEN" "${BUILD_NUMBER}"
                    '''
                }
            }
        }

        stage('Smoke') {
            when {
                allOf {
                    branch 'dev'
                    expression { fileExists('scripts/smoke-test.sh') }
                }
            }
            steps {
                sh './scripts/smoke-test.sh staging'
            }
        }

        stage('Production Approval') {
            when {
                allOf {
                    branch 'main'
                    expression { fileExists('scripts/deploy-production.sh') }
                }
            }
            steps {
                input message: '운영 배포를 승인하시겠습니까?', ok: '운영 배포 승인', submitter: 'release-managers'
            }
        }

        stage('Production') {
            when {
                allOf {
                    branch 'main'
                    expression { fileExists('scripts/deploy-production.sh') }
                }
            }
            steps {
                withCredentials([string(credentialsId: 'production-deploy-token', variable: 'DEPLOY_TOKEN')]) {
                    sh '''
                        set +x
                        ./scripts/deploy-production.sh "$DEPLOY_TOKEN" "${BUILD_NUMBER}"
                    '''
                }
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}

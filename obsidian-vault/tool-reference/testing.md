# Testing — Tool Reference

## When to consult this document

Use `rag-snippet query="testing <stack> <level>"` to retrieve tool recommendations and commands when:
- Setting up tests for a new project
- Configuring CI pipeline test gates
- Choosing between test frameworks for a given stack
- Publishing test results or coverage to Azure DevOps

Full methodology: `rag-snippet query="testing methodology 5W2H pyramid"`

---

## Quick lookup: tool by stack and level

| Stack | Unit/Integration | E2E | Instrumented |
|---|---|---|---|
| typescript-lib | Vitest 4.x | — | — |
| typescript-app | Vitest 4.x | Playwright 1.50+ | — |
| python-lib | pytest 8.x | — | — |
| python-app | pytest 8.x | Playwright for Python 1.50+ | — |
| swift-ios | XCTest (Xcode 16) | XCUITest | XCUITest on device |
| csharp-app | xUnit 2.9 / NUnit 4 / MSTest 3 | Playwright for .NET 1.50+ | — |
| kotlin-android | JUnit 5 + Robolectric | Espresso / UI Automator | Espresso (emulator/device) |
| generic | Language-native + gotestsum/PHPUnit/RSpec | Playwright (if web) | — |

---

## Output formats (required for Azure DevOps)

**Test results → JUnit XML**

| Stack | How |
|---|---|
| typescript-* | `vitest run --reporter=junit --outputFile=TEST-results.xml` |
| python-* | `pytest --junitxml=TEST-results.xml` |
| swift-ios | `xcresultparser --output-format junit TestResults.xcresult > TEST-results.xml` |
| csharp-app | `dotnet test --logger "trx"` (VSTest) or `--logger "junit"` (JUnit via JunitXml.TestLogger) |
| kotlin-android | `./gradlew test` — output at `build/test-results/**/TEST-*.xml` (native) |

**Coverage → Cobertura XML**

| Stack | How |
|---|---|
| typescript-* | `vitest run --coverage --coverage.reporter=cobertura` → `coverage.xml` |
| python-* | `pytest --cov=src --cov-report=xml:coverage.xml` |
| swift-ios | `slather coverage --cobertura-xml --scheme App App.xcodeproj` |
| csharp-app | `dotnet test --collect:"XPlat Code Coverage"` → `TestResults/*/coverage.cobertura.xml` |
| kotlin-android | `./gradlew createDebugCoverageReport` → JaCoCo XML (accepted directly by Azure) |
| any | `reportgenerator -reports:input.xml -targetdir:out -reporttypes:Cobertura` |

---

## Azure DevOps pipeline tasks

```yaml
# Publish test results (JUnit)
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: '**/TEST-*.xml'
    mergeTestResults: true
    failTaskOnFailedTests: true

# Publish coverage (Cobertura or JaCoCo)
- task: PublishCodeCoverageResults@2
  inputs:
    summaryFileLocation: '**/coverage.xml'
    pathToSources: 'src'
    failIfCoverageEmpty: true
```

For .NET TRX: `testResultsFormat: 'VSTest'`, `testResultsFiles: '**/*.trx'`

---

## CI agent requirements

- **Docker:** typescript-*, python-*, csharp-app, kotlin-android (JVM tests only)
- **macOS agent** (`vmImage: macos-15`): swift-ios (all levels), kotlin-android (instrumented)
- **Emulator (Android):** `emulator -no-window -no-audio -no-boot-anim -avd pixel_6_api_34`
- **Playwright Docker image:** `mcr.microsoft.com/playwright:v1.50.0-noble`

---

## Azure Test Plans

Structure: Plan → Suite → Test Case → Steps

- Requirement-based suite: links Test Cases to PBIs/User Stories, auto-tracks pipeline pass/fail
- Associate automated test: run pipeline once → Test Plans UI → Associate Automation → select method
- Future automation (EP-002): `azure-test-suite-sync` tool — parses test files and creates Test Cases via REST API

Full design: `rag-snippet query="azure test plans automation code to azure EP-002"`

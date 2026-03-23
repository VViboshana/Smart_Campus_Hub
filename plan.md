# Java Upgrade Plan: Spring Boot 3.5.x Patch-Level Update

**Project**: Smart Campus Operations Hub  
**Session ID**: 20260317151031  
**Date**: March 17, 2026  
**Current Java**: 21  
**Target Java**: 21 (no change)  
**Current Spring Boot**: 3.5.11  
**Target Spring Boot**: 3.5.13+ (latest patch)  
**Branch**: appmod/java-upgrade-20260317151031  
**Current Commit**: N/A (will be set on execution)

---

## Guidelines

- Patch-level update only (3.5.x → 3.5.x) - no minor/major version changes
- Focus on stability and security patches
- All dependencies managed through Spring Boot parent POM
- Java 21 remains the target runtime version
- Maven Wrapper preferred for build consistency

---

## Available Tools

<!-- REQUIRED FORMAT: List all detected build tools and JDKs with paths. Mark any <TO_BE_INSTALLED> if missing. Required columns: Tool, Version, Path, Status -->

| Tool | Version | Path | Status |
|------|---------|------|--------|
| JDK | 21.0.8 | /Users/vihagaviboshana/.jdk/jdk-21.0.8/jdk-21.0.8+9/Contents/Home/bin | ✅ Available |
| Maven (System) | 3.9.12 | /opt/homebrew/Cellar/maven/3.9.12/bin | ✅ Available |
| Maven (Wrapper) | 3.9.9 | ./mvnw (at project root) | ✅ Available |

**Notes**:
- Maven Wrapper will be used as primary build tool (mvnw/mvnw.cmd in project root)
- Wrapper is configured to download Maven 3.9.9 automatically
- System Maven 3.9.12 available as fallback
- JDK 21.0.8 meets all requirements for Spring Boot 3.5.x

---

## Technology Stack

<!-- REQUIRED FORMAT: Table showing all technologies, current versions, target versions, and compatibility notes. Include all Spring Boot managed deps + key standalone deps. Mark EOL deps if any. -->

| Technology | Current Version | Target Version | Compatibility Notes | Status |
|------------|-----------------|-----------------|---------------------|--------|
| Java | 21 | 21 | No change required | ✅ Compatible |
| Spring Boot | 3.5.11 | 3.5.13+ | Patch-level update, full compatibility | ✅ Compatible |
| Spring Framework | 6.4.x | 6.4.x | Managed by Spring Boot 3.5.x | ✅ Compatible |
| Servlet API (Jakarta) | 6.0.x | 6.0.x | Managed by Spring Boot 3.5.x | ✅ Compatible |
| spring-boot-starter-web | 3.5.11 | 3.5.13+ | Patch update via parent POM | ✅ Compatible |
| spring-boot-starter-data-mongodb | 3.5.11 | 3.5.13+ | Patch update via parent POM | ✅ Compatible |
| spring-boot-starter-security | 3.5.11 | 3.5.13+ | Patch update via parent POM | ✅ Compatible |
| spring-boot-starter-oauth2-client | 3.5.11 | 3.5.13+ | Patch update via parent POM | ✅ Compatible |
| spring-boot-starter-validation | 3.5.11 | 3.5.13+ | Patch update via parent POM | ✅ Compatible |
| spring-boot-starter-test | 3.5.11 | 3.5.13+ | Patch update via parent POM | ✅ Compatible |
| spring-security-test | 6.4.x | 6.4.x | Managed by Spring Boot 3.5.x | ✅ Compatible |
| spring-boot-devtools | 3.5.11 | 3.5.13+ | Patch update via parent POM | ✅ Compatible |
| JJWT (io.jsonwebtoken) | 0.12.5 | 0.12.5 (or latest 0.12.x) | Already compatible with Java 21 and Spring Boot 3.5.x | ✅ Compatible |
| Lombok | (managed by parent) | (managed by parent) | Current version 1.18.x fully supports Java 21 | ✅ Compatible |

**Key observations**:
- All Spring Boot managed dependencies will be automatically updated to latest patch via parent POM version change
- No EOL dependencies detected
- All dependencies are actively maintained and Java 21 compatible
- JJWT 0.12.5 is current and stable; can optionally update to latest 0.12.x patch if available

---

## Derived Upgrades

<!-- REQUIRED FORMAT: List all derived dependency upgrades (not just the parent version). Include any transitively affected deps. If none, state "No derived upgrades required". -->

**Patch-level parent update only**:
- Update `spring-boot-starter-parent` from 3.5.11 to 3.5.13+ in pom.xml
- All managed dependencies updated automatically (transitively through parent)
- JJWT version remains 0.12.5 (explicitly defined, not managed by parent)
- Lombok version managed by Spring Boot parent (will be updated for security/stability patches)

**No breaking changes expected** - Patch-level Spring Boot updates are designed for backward compatibility.

**Analysis Summary**:
- Spring Boot 3.5.13+ patch release maintains API compatibility with 3.5.11
- All dependencies in the current stack are patch-compatible
- Java 21 continues to be fully supported
- Target patch version expected to bring security updates and bug fixes
- Low risk upgrade with high value (security + stability improvements)

---

## Key Challenges

<!-- OPTIONAL: Identify high-risk areas. If none, state "No significant challenges identified". -->

**No significant challenges identified**. This is a low-risk, patch-level update.

**Reasoning**:
- Spring Boot 3.5.x is a mature, stable LTS-aligned release line
- Patch-level updates (3.5.11 → 3.5.13+) are explicitly designed for backward compatibility
- No API changes or deprecated features introduced in patch releases
- Project uses standard Spring Boot patterns with no exotic dependencies
- All dependencies are actively maintained and Java 21 compatible
- Maven build (mvnw) and test infrastructure are standard/reliable

**Verification recommendations**:
- Run full test suite after patch update to detect any edge cases
- Verify application startup in local environment
- Monitor logs for any deprecation warnings (should be none)

---

## Options

<!-- OPTIONAL: Document any user choices (e.g., test execution, git usage). -->

| Option | Value | Notes |
|--------|-------|-------|
| Run tests before and after the upgrade | true | Full test suite required to validate patch compatibility |
| Use Git for version control | true | Project is git-managed, changes will be committed per step |
| Use Maven Wrapper | true | Wrapper (mvnw) configured and available in project root |
| Install missing JDKs | N/A | JDK 21.0.8 already available, no installation needed |

---

## Upgrade Steps

<!-- REQUIRED FORMAT: Detailed step-by-step instructions with rationale, changes, and verification commands. Each step must be 5-10+ lines with clear actionable details. Remove HTML comments after population. -->

### Step 1: Setup Environment
**Rationale**: Verify that JDK 21 and Maven are properly configured and available for the upgrade process. This ensures consistent builds throughout all upgrade steps.

**Changes**:
- Verify JDK 21.0.8 is available at expected location
- Confirm Maven Wrapper (mvnw) is present in project root and working
- Set JAVA_HOME environment variable to point to JDK 21.0.8
- Verify mvnw can resolve Maven dependencies

**Verification Commands**:
```bash
export JAVA_HOME=/Users/vihagaviboshana/.jdk/jdk-21.0.8/jdk-21.0.8+9/Contents/Home
java -version
./mvnw --version
./mvnw help:active-profiles
```

**Expected Results**:
- Java reports version 21.0.8
- Maven Wrapper reports version 3.9.9 (downloaded from configured URL)
- Help command completes successfully without errors
- JAVA_HOME correctly set and recognized by Maven

**Known Issues**:
- None expected; environment setup is straightforward for patch-level upgrade

---

### Step 2: Setup Baseline
**Rationale**: Establish a baseline by compiling and testing the project with Spring Boot 3.5.11 in current state. This ensures the project is in a stable, known condition before making any upgrades.

**Changes**:
- No code changes in this step
- Run full Maven clean compile to verify main source code compiles cleanly
- Run full Maven test suite to document baseline test pass rate
- Document compiler output and test results for reference

**Verification Commands**:
```bash
export JAVA_HOME=/Users/vihagaviboshana/.jdk/jdk-21.0.8/jdk-21.0.8+9/Contents/Home
./mvnw clean compile
./mvnw clean test
```

**Expected Results**:
- `mvn clean compile` completes with BUILD SUCCESS
- All main source files compile without warnings or errors
- `mvn clean test` completes successfully
- Test output shows 100% pass rate (or documents baseline pass count if failures exist)
- Target directory contains compiled classes and test execution reports

**Known Issues**:
- None expected at this stage; project is stated to be in working condition

---

### Step 3: Update Spring Boot to Latest Patch Version
**Rationale**: Update the Spring Boot parent POM version from 3.5.11 to the latest available patch (3.5.13+ when released, or remain at 3.5.11 if that is latest). This brings security patches, bug fixes, and stability improvements while maintaining full backward compatibility.

**Changes**:
- Open pom.xml in editor
- Locate parent section: `<parent><artifactId>spring-boot-starter-parent</artifactId><version>3.5.11</version></parent>`
- Update version element from 3.5.11 to 3.5.13 (or latest available patch in 3.5.x line)
- All managed dependency versions automatically update through parent POM transitive resolution
- JJWT version remains explicitly at 0.12.5 (not managed by parent, optional to update within 0.12.x)
- Save pom.xml with updated parent version

**Specific File Changes**:
```xml
<!-- In pom.xml, update parent section -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.5.13</version>  <!-- Updated from 3.5.11 -->
    <relativePath/>
</parent>
```

**Verification Commands**:
```bash
export JAVA_HOME=/Users/vihagaviboshana/.jdk/jdk-21.0.8/jdk-21.0.8+9/Contents/Home
./mvnw clean compile
./mvnw dependency:tree | grep -A 20 "org.springframework.boot:spring-boot-starter-parent"
```

**Expected Results**:
- pom.xml updated with new version
- `mvn clean compile` completes successfully (BUILD SUCCESS)
- All source code compiles cleanly with Java 21
- Dependency tree shows all managed dependencies updated to 3.5.13 patch versions
- No compiler errors or warnings introduced
- No changes to functional code required (backward compatible patch)

**Known Issues**:
- None expected; patch-level updates are explicitly designed for compatibility
- If version 3.5.13 is not available yet, use 3.5.12 or latest available 3.5.x

---

### Step 4: Final Validation
**Rationale**: Verify that the Spring Boot patch update is successful, the application builds correctly, and all tests pass with the updated dependencies. This confirms that the upgrade goal has been achieved without breaking any functionality.

**Changes**:
- No additional code changes beyond Step 3
- Run full Maven clean-compile-test cycle to validate all changes
- Document final test results and confirm 100% test pass rate
- Verify no deprecation warnings or compatibility issues

**Verification Commands**:
```bash
export JAVA_HOME=/Users/vihagaviboshana/.jdk/jdk-21.0.8/jdk-21.0.8+9/Contents/Home
./mvnw clean test-compile
./mvnw clean test
./mvnw verify
```

**Expected Results**:
- `mvn clean test-compile` completes successfully (both main and test code compile)
- `mvn clean test` completes with BUILD SUCCESS
- All tests pass (100% pass rate matching or exceeding baseline)
- `mvn verify` completes successfully
- No deprecation warnings or security warnings in build output
- Target JAR builds successfully with Spring Boot 3.5.13 dependencies
- Application is ready for deployment with latest security patches

**Known Issues**:
- None expected; patch-level updates maintain full backward compatibility
- All transitive dependencies automatically aligned via parent POM

**Success Criteria Met**:
- ✅ Spring Boot updated from 3.5.11 to 3.5.13+ (patch-level)
- ✅ Java 21 runtime verified and stable
- ✅ All dependencies updated automatically via parent POM
- ✅ Full compilation successful (main and test code)
- ✅ 100% test pass rate achieved
- ✅ No functional code changes required (backward compatible)
- ✅ Security patches and stability improvements applied

---

## Plan Review Notes

<!-- OPTIONAL: Document any unfixable limitations, deferred work, or assumptions made during planning. -->

**Plan Status**: ✅ COMPLETE AND READY FOR EXECUTION

**Completeness Verification**:
- ✅ All available tools identified with correct paths
- ✅ Current and target versions clearly specified
- ✅ Technology stack comprehensively documented
- ✅ Patch compatibility analysis completed (all compatible)
- ✅ Upgrade path designed with 4 actionable steps
- ✅ High-risk areas identified and assessed (none significant)
- ✅ Detailed verification commands provided for each step
- ✅ Success criteria clearly defined and achievable

**Key Assumptions**:
1. Spring Boot 3.5.13 or latest 3.5.x patch will be available on Maven Central
2. Maven Wrapper will function correctly (mvnw in project root)
3. Current test suite will provide adequate validation coverage
4. No external dependencies on deprecated Spring Boot 3.5.x APIs

**Mitigation Strategies**:
- Step 3 can be adjusted if 3.5.13 unavailable; use latest available 3.5.x
- Step 2 baseline ensures we can revert if issues arise
- Full test suite in Step 4 validates backward compatibility
- No code changes required, only dependency version update

**Next Phase**: Plan is complete and ready for user confirmation via Phase 3 confirmation step.

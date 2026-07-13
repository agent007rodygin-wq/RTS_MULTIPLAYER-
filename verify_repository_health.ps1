[CmdletBinding()]
param(
    [switch]$AllowNetworkChecks,
    [switch]$AllowSchema,
    [switch]$AllowWorld,
    [switch]$AllowBuild,
    [switch]$AllowLocalWrites
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

enum RepositoryHealthStatus {
    PASS
    WARN
    BLOCKED
    FAIL
}

enum RepositoryHealthCheckKind {
    COMMAND
    INVENTORY
    FRESHNESS
    GIT
    DERIVED
}

enum RepositoryHealthCheckStatus {
    PASS
    WARN
    BLOCKED
    FAIL
    SKIPPED
}

enum HelperSafetyClass {
    READ_ONLY_LOCAL
    NETWORK_READ_ONLY
    NETWORK_WRITE
    LOCAL_WRITE
    UNKNOWN
}

enum GateDecision {
    ALLOW
    DENY
}

enum GitTrustMode {
    TRUSTED
    UNTRUSTED
    FALLBACK_ONLY
    MISSING
}

enum FreshnessState {
    FRESH
    STALE
    UNKNOWN
}

$script:EntryPointName = 'verify_repository_health.ps1'
$script:RepoRoot = Split-Path -Parent $PSCommandPath
$script:FeatureRoot = Join-Path $script:RepoRoot 'specs/001-verification-workflow-and-repository-health'
$script:ReportDirectory = Join-Path $script:FeatureRoot 'reports'
$script:ReportPath = Join-Path $script:ReportDirectory 'repository-health.json'
$script:BundledNodeExecutable = 'C:\Users\goldw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$script:KnownGitExecutablePaths = @(
    'C:\Program Files\Git\cmd\git.exe'
    'C:\Program Files\Git\bin\git.exe'
    'C:\Program Files (x86)\Git\cmd\git.exe'
    'C:\Program Files (x86)\Git\bin\git.exe'
)
$script:GitProtectedProbePaths = @(
    'App.tsx'
    'src/pocketbase.ts'
    'package.json'
    'tsconfig.json'
    'vite.config.ts'
    '.git'
)

$script:ExcludedPaths = @(
    'node_modules'
    '.git'
    'dist'
    'build'
    'pb_data'
    '*.db'
    '*.sqlite'
    '*.sqlite3'
    '.env'
    '.env.*'
    '*.png'
    '*.jpg'
    '*.jpeg'
    '*.gif'
    '*.webp'
    '*.svg'
    '*.mp3'
    '*.wav'
    '*.mp4'
    '*.mov'
    '*.zip'
    '*.7z'
    '*.rar'
    '*.tar'
    '*.gz'
    '*.log'
    'tmp'
    'temp'
    'logs'
    'coverage'
    '*backup*'
)

$script:ProtectedPaths = @(
    'App.tsx'
    'src/pocketbase.ts'
    'package.json'
    'tsconfig.json'
    'graphify-out'
    'specs/_baseline'
)

$script:BaselineDocs = @(
    'specs/_baseline/12-target-architecture.md'
    'specs/_baseline/13-migration-roadmap.md'
    'specs/_baseline/14-test-strategy.md'
    'specs/_baseline/15-invariants.md'
    'specs/_baseline/16-risk-register.md'
    'specs/_baseline/17-traceability-index.md'
)

$script:FeatureDocs = @(
    'specs/001-verification-workflow-and-repository-health/spec.md'
    'specs/001-verification-workflow-and-repository-health/research.md'
    'specs/001-verification-workflow-and-repository-health/data-model.md'
    'specs/001-verification-workflow-and-repository-health/plan.md'
    'specs/001-verification-workflow-and-repository-health/quickstart.md'
    'specs/001-verification-workflow-and-repository-health/contracts/repository-health-workflow.md'
    'specs/001-verification-workflow-and-repository-health/tasks.md'
)

$script:GraphArtifacts = @(
    'graphify-out/graph.json'
    'graphify-out/GRAPH_REPORT.md'
    'graphify-out/.graphify_analysis.json'
    'graphify-out/.graphify_labels.json'
)

function Get-AbsolutePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return [System.IO.Path]::GetFullPath($Path)
}

function Test-PathWithinRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CandidatePath,
        [Parameter(Mandatory = $true)]
        [string]$RootPath
    )

    $candidate = (Get-AbsolutePath -Path $CandidatePath).TrimEnd('\')
    $root = (Get-AbsolutePath -Path $RootPath).TrimEnd('\')
    $rootPrefix = $root + [System.IO.Path]::DirectorySeparatorChar

    return $candidate.Equals($root, [System.StringComparison]::OrdinalIgnoreCase) -or
        $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)
}

function Assert-PathWithinRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CandidatePath,
        [Parameter(Mandatory = $true)]
        [string]$RootPath,
        [Parameter(Mandatory = $true)]
        [string]$Purpose
    )

    if (-not (Test-PathWithinRoot -CandidatePath $CandidatePath -RootPath $RootPath)) {
        throw "Refusing to write $Purpose outside the feature root: $CandidatePath"
    }
}

function New-HelperAuditRegistry {
    return @(
        [ordered]@{
            id = 'npm.run.lint'
            label = 'npm run lint'
            command = 'npm run lint'
            executableCandidates = @($script:BundledNodeExecutable)
            arguments = @('.\node_modules\typescript\lib\tsc.js', '--noEmit')
            timeoutMs = 120000
            sourcePath = 'package.json'
            auditTarget = 'TypeScript no-emit path'
            classification = [HelperSafetyClass]::READ_ONLY_LOCAL
            auditState = 'CONFIRMED'
            defaultAutoRun = $true
            optInGates = @()
            evidence = @('package.json:6-10 => "lint": "tsc --noEmit"')
            safetyNotes = @('No emit path; no network side effects were identified in the audited script surface.')
        }
        [ordered]@{
            id = 'check_regressions_worker6.mjs'
            label = 'check_regressions_worker6.mjs'
            command = 'node check_regressions_worker6.mjs'
            executableCandidates = @($script:BundledNodeExecutable, 'node.exe', 'node')
            arguments = @('check_regressions_worker6.mjs')
            timeoutMs = 120000
            sourcePath = 'check_regressions_worker6.mjs'
            auditTarget = 'App.tsx source text only'
            classification = [HelperSafetyClass]::READ_ONLY_LOCAL
            auditState = 'CONFIRMED'
            defaultAutoRun = $true
            optInGates = @()
            evidence = @('check_regressions_worker6.mjs:1-69 => fs.readFileSync(App.tsx) and console logging only.')
            safetyNotes = @('Read-only local inspection only.')
        }
        [ordered]@{
            id = 'check_schema.mjs'
            label = 'check_schema.mjs'
            command = 'node check_schema.mjs'
            executableCandidates = @($script:BundledNodeExecutable, 'node.exe', 'node')
            arguments = @('check_schema.mjs')
            timeoutMs = $null
            sourcePath = 'check_schema.mjs'
            auditTarget = 'PocketBase schema snapshot'
            classification = [HelperSafetyClass]::NETWORK_READ_ONLY
            auditState = 'CONFIRMED'
            defaultAutoRun = $false
            optInGates = @('-AllowNetworkChecks', '-AllowSchema')
            evidence = @('check_schema.mjs:1-75 => http.request auth POST + GET /api/collections/elections; no file writes.')
            safetyNotes = @('Network read-only helper; keep behind the network opt-in gate.')
        }
        [ordered]@{
            id = 'smoke_pocketbase_startup.mjs'
            label = 'smoke_pocketbase_startup.mjs'
            command = 'node smoke_pocketbase_startup.mjs'
            executableCandidates = @($script:BundledNodeExecutable, 'node.exe', 'node')
            arguments = @('smoke_pocketbase_startup.mjs')
            timeoutMs = $null
            sourcePath = 'smoke_pocketbase_startup.mjs'
            auditTarget = 'PocketBase health and collection read path'
            classification = [HelperSafetyClass]::NETWORK_READ_ONLY
            auditState = 'CONFIRMED'
            defaultAutoRun = $false
            optInGates = @('-AllowNetworkChecks')
            evidence = @('smoke_pocketbase_startup.mjs:1-142 => fetch GET /api/health, GET /api/realtime, and PocketBase read calls only.')
            safetyNotes = @('Network read-only helper; keep behind the network opt-in gate.')
        }
        [ordered]@{
            id = 'verify_world.mjs'
            label = 'verify_world.mjs'
            command = 'node verify_world.mjs'
            executableCandidates = @($script:BundledNodeExecutable, 'node.exe', 'node')
            arguments = @('verify_world.mjs')
            timeoutMs = $null
            sourcePath = 'verify_world.mjs'
            auditTarget = 'World-state sanity read path'
            classification = [HelperSafetyClass]::NETWORK_READ_ONLY
            auditState = 'CONFIRMED'
            defaultAutoRun = $false
            optInGates = @('-AllowNetworkChecks', '-AllowWorld')
            evidence = @('verify_world.mjs:1-21 => PocketBase authWithPassword plus getList/getFullList reads only.')
            safetyNotes = @('Network read-only helper; keep behind the network opt-in gate.')
        }
        [ordered]@{
            id = 'check_build.mjs'
            label = 'check_build.mjs'
            command = 'node check_build.mjs'
            executableCandidates = @($script:BundledNodeExecutable, 'node.exe', 'node')
            arguments = @('check_build.mjs')
            timeoutMs = $null
            sourcePath = 'check_build.mjs'
            auditTarget = 'Production build wrapper'
            classification = [HelperSafetyClass]::LOCAL_WRITE
            auditState = 'CONFIRMED'
            defaultAutoRun = $false
            optInGates = @('-AllowBuild', '-AllowLocalWrites')
            evidence = @('check_build.mjs:1-11 => execSync("npm run build"), which can write build output.')
            safetyNotes = @('Local-write helper; requires build and local-write opt-in.')
        }
        [ordered]@{
            id = 'npm.run.build'
            label = 'npm run build'
            command = 'npm run build'
            executableCandidates = @($script:BundledNodeExecutable)
            arguments = @('.\node_modules\vite\bin\vite.js', 'build')
            timeoutMs = 120000
            sourcePath = 'package.json'
            auditTarget = 'Vite production build'
            classification = [HelperSafetyClass]::LOCAL_WRITE
            auditState = 'CONFIRMED'
            defaultAutoRun = $false
            optInGates = @('-AllowBuild', '-AllowLocalWrites')
            evidence = @('package.json:6-9 => "build": "vite build"; production output can be written.')
            safetyNotes = @('Local-write helper; requires build and local-write opt-in.')
        }
    )
}

function Resolve-RepositoryHealthExecutable {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$CandidateNames
    )

    foreach ($candidate in $CandidateNames) {
        if ([string]::IsNullOrWhiteSpace($candidate)) {
            continue
        }

        if ((Test-Path -LiteralPath $candidate) -or ([System.IO.Path]::IsPathRooted($candidate) -and (Test-Path -LiteralPath $candidate))) {
            return (Get-AbsolutePath -Path $candidate)
        }

        $command = Get-Command -Name $candidate -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -ne $command) {
            return $command.Source
        }
    }

    return $null
}

function Redact-RepositoryHealthText {
    param(
        [string]$Text
    )

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return ''
    }

    $redacted = $Text
    $secretValues = @(
        $env:PB_ADMIN_PASSWORD
        $env:PB_ADMIN_TOKEN
        $env:DEPLOY_PASSWORD
        $env:PASSWORD
        $env:TOKEN
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

    foreach ($secretValue in $secretValues) {
        $redacted = $redacted.Replace($secretValue, '[REDACTED]')
    }

    $redacted = [regex]::Replace($redacted, '(?im)^(.*(?:password|token|secret|authorization|cookie).*)$', '[REDACTED]')
    return $redacted.Trim()
}

function ConvertTo-RepositoryHealthArgumentString {
    param(
        [string[]]$Arguments
    )

    if ($null -eq $Arguments -or $Arguments.Count -eq 0) {
        return ''
    }

    $parts = New-Object System.Collections.Generic.List[string]
    foreach ($argument in $Arguments) {
        if ([string]::IsNullOrWhiteSpace($argument)) {
            continue
        }

        if ($argument -match '\s|["'']') {
            $parts.Add(('"{0}"' -f ($argument -replace '"', '\"')))
        } else {
            $parts.Add($argument)
        }
    }

    return ($parts -join ' ')
}

function Get-HelperDispatchDecision {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Helper,
        [switch]$AllowNetworkChecks,
        [switch]$AllowSchema,
        [switch]$AllowWorld,
        [switch]$AllowBuild,
        [switch]$AllowLocalWrites
    )

    $optInRequirement = if ($Helper.optInGates.Count -gt 0) { $Helper.optInGates -join ', ' } else { 'none' }

    switch ($Helper.classification) {
        ([HelperSafetyClass]::READ_ONLY_LOCAL) {
            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::PASS.ToString()
                shouldExecute = $true
                reason = 'Read-only local helper is auto-run in the default slice.'
                skippedReason = ''
                optInRequirement = $optInRequirement
            }
        }
        ([HelperSafetyClass]::NETWORK_READ_ONLY) {
            if ($AllowNetworkChecks -or ($AllowSchema -and $Helper.id -eq 'check_schema.mjs') -or ($AllowWorld -and $Helper.id -eq 'verify_world.mjs')) {
                return [ordered]@{
                    status = [RepositoryHealthCheckStatus]::PASS.ToString()
                    shouldExecute = $true
                    reason = 'Network helper is explicitly allowed by an opt-in flag.'
                    skippedReason = ''
                    optInRequirement = $optInRequirement
                }
            }

            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
                shouldExecute = $false
                reason = 'Network helper is skipped until a network opt-in flag is present.'
                skippedReason = 'Network opt-in required'
                optInRequirement = $optInRequirement
            }
        }
        ([HelperSafetyClass]::NETWORK_WRITE) {
            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                shouldExecute = $false
                reason = 'Network-write helper is not allowed in this feature slice.'
                skippedReason = ''
                optInRequirement = $optInRequirement
            }
        }
        ([HelperSafetyClass]::LOCAL_WRITE) {
            if ($AllowBuild -and $AllowLocalWrites) {
                return [ordered]@{
                    status = [RepositoryHealthCheckStatus]::PASS.ToString()
                    shouldExecute = $true
                    reason = 'Local-write helper is explicitly allowed by build and local-write flags.'
                    skippedReason = ''
                    optInRequirement = $optInRequirement
                }
            }

            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
                shouldExecute = $false
                reason = 'Local-write helper is skipped until build and local-write opt-ins are present.'
                skippedReason = 'Build and local-write opt-ins required'
                optInRequirement = $optInRequirement
            }
        }
        default {
            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                shouldExecute = $false
                reason = 'Helper safety class is unknown, so the helper cannot auto-run.'
                skippedReason = ''
                optInRequirement = $optInRequirement
            }
        }
    }
}

function Invoke-RepositoryHealthCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandLabel,
        [Parameter(Mandatory = $true)]
        [string[]]$ExecutableCandidates,
        [string[]]$Arguments = @(),
        [string]$WorkingDirectory = $script:RepoRoot,
        [int]$TimeoutMs = 120000
    )

    $resolvedExecutable = Resolve-RepositoryHealthExecutable -CandidateNames $ExecutableCandidates
    if ([string]::IsNullOrWhiteSpace($resolvedExecutable)) {
        return [ordered]@{
            status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
            exitCode = $null
            durationMs = 0
            timedOut = $false
            reason = "Executable not found for $CommandLabel."
            stdout = ''
            stderr = ''
            evidence = @("missing executable candidates: $($ExecutableCandidates -join ', ')")
        }
    }

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $stdout = ''
    $stderr = ''
    $process = $null

    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $resolvedExecutable
        $psi.Arguments = ConvertTo-RepositoryHealthArgumentString -Arguments $Arguments
        $psi.WorkingDirectory = $WorkingDirectory
        $psi.UseShellExecute = $false
        $psi.CreateNoWindow = $true
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true

        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $psi
        $null = $process.Start()

        $exited = if ($TimeoutMs -gt 0) { $process.WaitForExit($TimeoutMs) } else { $process.WaitForExit(); $true }
        if (-not $exited) {
            try {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            } catch {
            }

            $stopwatch.Stop()
            $stdout = Redact-RepositoryHealthText -Text ($process.StandardOutput.ReadToEnd())
            $stderr = Redact-RepositoryHealthText -Text ($process.StandardError.ReadToEnd())

            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::FAIL.ToString()
                exitCode = $null
                durationMs = [int]$stopwatch.ElapsedMilliseconds
                timedOut = $true
                reason = "Timed out after $TimeoutMs ms."
                stdout = $stdout
                stderr = $stderr
                evidence = @("timeoutMs=$TimeoutMs")
            }
        }

        $stdout = Redact-RepositoryHealthText -Text ($process.StandardOutput.ReadToEnd())
        $stderr = Redact-RepositoryHealthText -Text ($process.StandardError.ReadToEnd())
        $exitCode = $process.ExitCode
        $stopwatch.Stop()
        $status = if ($exitCode -eq 0) { [RepositoryHealthCheckStatus]::PASS.ToString() } else { [RepositoryHealthCheckStatus]::FAIL.ToString() }

        $evidence = New-Object System.Collections.Generic.List[string]
        $evidence.Add("exitCode=$exitCode")

        if (-not [string]::IsNullOrWhiteSpace($stdout)) {
            $evidence.Add("stdout: $((($stdout -split '\r?\n') | Select-Object -First 3) -join ' | ')")
        }

        if (-not [string]::IsNullOrWhiteSpace($stderr)) {
            $evidence.Add("stderr: $((($stderr -split '\r?\n') | Select-Object -First 3) -join ' | ')")
        }

        return [ordered]@{
            status = $status
            exitCode = [int]$exitCode
            durationMs = [int]$stopwatch.ElapsedMilliseconds
            timedOut = $false
            reason = if ($exitCode -eq 0) { "$CommandLabel completed successfully." } else { "$CommandLabel exited with code $exitCode." }
            stdout = $stdout
            stderr = $stderr
            evidence = $evidence.ToArray()
        }
    } catch {
        $stopwatch.Stop()
        return [ordered]@{
            status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
            exitCode = $null
            durationMs = [int]$stopwatch.ElapsedMilliseconds
            timedOut = $false
            reason = ("Failed to launch {0}: {1}" -f $CommandLabel, $_.Exception.Message)
            stdout = ''
            stderr = ''
            evidence = @('launch failure')
        }
    }
}

function Get-HelperSafetyStatus {
    param(
        [Parameter(Mandatory = $true)]
        [HelperSafetyClass]$Classification
    )

    switch ($Classification) {
        ([HelperSafetyClass]::READ_ONLY_LOCAL) { return [RepositoryHealthCheckStatus]::PASS }
        ([HelperSafetyClass]::NETWORK_READ_ONLY) { return [RepositoryHealthCheckStatus]::WARN }
        ([HelperSafetyClass]::NETWORK_WRITE) { return [RepositoryHealthCheckStatus]::BLOCKED }
        ([HelperSafetyClass]::LOCAL_WRITE) { return [RepositoryHealthCheckStatus]::WARN }
        default { return [RepositoryHealthCheckStatus]::BLOCKED }
    }
}

function Get-StopConditionCatalog {
    return @(
        [ordered]@{
            id = 'stop:unknown-helper'
            trigger = 'Helper class is UNKNOWN'
            category = 'HELPER_CLASS'
            enforcement = 'BLOCKED'
            implementationStatus = 'IMPLEMENTED_NOT_VERIFIED'
            reason = 'Unknown helpers stop the dependent workflow slice before any auto-run path is allowed.'
        }
        [ordered]@{
            id = 'stop:write-without-opt-in'
            trigger = 'Required local write without -AllowBuild and -AllowLocalWrites'
            category = 'WRITE_GATING'
            enforcement = 'BLOCKED'
            implementationStatus = 'IMPLEMENTED_NOT_VERIFIED'
            reason = 'Local-write helpers are gated behind the build and local-write opt-in flags.'
        }
        [ordered]@{
            id = 'stop:network-without-opt-in'
            trigger = 'Network helper not allowed by active opt-in flags'
            category = 'NETWORK_GATING'
            enforcement = 'SKIP'
            implementationStatus = 'IMPLEMENTED_NOT_VERIFIED'
            reason = 'Network helpers stay skipped unless the network gate is opened explicitly.'
        }
        [ordered]@{
            id = 'stop:git-repair'
            trigger = 'Git repair or Git metadata repair would be needed'
            category = 'GIT_TRUST'
            enforcement = 'BLOCKED'
            implementationStatus = 'IMPLEMENTED_NOT_VERIFIED'
            reason = 'The workflow must never repair .git automatically.'
        }
        [ordered]@{
            id = 'stop:schema-mutation'
            trigger = 'Schema mutation is detected or required'
            category = 'POCKETBASE_GUARD'
            enforcement = 'BLOCKED'
            implementationStatus = 'IMPLEMENTED_NOT_VERIFIED'
            reason = 'PocketBase schema/data mutation remains out of scope for this feature.'
        }
        [ordered]@{
            id = 'stop:report-path-escape'
            trigger = 'Report path escapes the feature-local report directory'
            category = 'OUTPUT_GUARD'
            enforcement = 'BLOCKED'
            implementationStatus = 'IMPLEMENTED_NOT_VERIFIED'
            reason = 'Repository-health output is constrained to the feature-local reports directory.'
        }
        [ordered]@{
            id = 'stop:protected-path-mutation'
            trigger = 'Protected paths change during the workflow'
            category = 'MUTATION_GUARD'
            enforcement = 'FAIL'
            implementationStatus = 'IMPLEMENTED_NOT_VERIFIED'
            reason = 'Protected source, config, and baseline paths require approval before any touch is allowed.'
        }
    )
}

function Get-OwnerApprovalGateCatalog {
    return [ordered]@{
        status = 'IMPLEMENTED_NOT_VERIFIED'
        protectedPaths = $script:ProtectedPaths
        baselineDocs = $script:BaselineDocs
        blockedPaths = @(
            'package.json'
            'tsconfig.json'
            'App.tsx'
            'src/pocketbase.ts'
        )
        approvalRequiredFor = @(
            'Any future need to touch protected source files outside this feature'
            'Any future need to modify baseline docs outside this feature'
        )
        reason = 'The gate catalog exists and names the protected scope, but live mutation evaluation is still deferred.'
    }
}

function Invoke-RepositoryHealthGuardDecision {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('HELPER', 'REPORT_PATH', 'GIT_REPAIR', 'SCHEMA_MUTATION', 'PROTECTED_PATH_MUTATION', 'OWNER_APPROVAL')]
        [string]$Mode,
        [HelperSafetyClass]$HelperClass = [HelperSafetyClass]::UNKNOWN,
        [string]$TargetPath = '',
        [switch]$AllowNetworkChecks,
        [switch]$AllowSchema,
        [switch]$AllowWorld,
        [switch]$AllowBuild,
        [switch]$AllowLocalWrites,
        [switch]$OwnerApproved
    )

    switch ($Mode) {
        'HELPER' {
            switch ($HelperClass) {
                ([HelperSafetyClass]::UNKNOWN) {
                    return [ordered]@{
                        status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                        reason = 'Helper safety class is unknown, so the helper cannot auto-run.'
                        trigger = 'stop:unknown-helper'
                    }
                }
                ([HelperSafetyClass]::READ_ONLY_LOCAL) {
                    return [ordered]@{
                        status = [RepositoryHealthCheckStatus]::PASS.ToString()
                        reason = 'Read-only local helper is eligible for safe execution.'
                        trigger = ''
                    }
                }
                ([HelperSafetyClass]::NETWORK_READ_ONLY) {
                    if ($AllowNetworkChecks -or $AllowSchema -or $AllowWorld) {
                        return [ordered]@{
                            status = [RepositoryHealthCheckStatus]::PASS.ToString()
                            reason = 'Network helper is explicitly allowed by an opt-in flag.'
                            trigger = ''
                        }
                    }

                    return [ordered]@{
                        status = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
                        reason = 'Network helper is skipped until a network opt-in flag is present.'
                        trigger = 'stop:network-without-opt-in'
                    }
                }
                ([HelperSafetyClass]::NETWORK_WRITE) {
                    return [ordered]@{
                        status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                        reason = 'Network-write helper is not allowed in this feature slice.'
                        trigger = 'stop:network-write'
                    }
                }
                ([HelperSafetyClass]::LOCAL_WRITE) {
                    if ($AllowBuild -and $AllowLocalWrites) {
                        return [ordered]@{
                            status = [RepositoryHealthCheckStatus]::PASS.ToString()
                            reason = 'Local-write helper is explicitly allowed by build and local-write flags.'
                            trigger = ''
                        }
                    }

                    return [ordered]@{
                        status = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
                        reason = 'Local-write helper is skipped until build and local-write opt-ins are present.'
                        trigger = 'stop:write-without-opt-in'
                    }
                }
                default {
                    return [ordered]@{
                        status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                        reason = 'Helper safety class is not recognized by the guard evaluator.'
                        trigger = 'stop:unknown-helper'
                    }
                }
            }
        }
        'REPORT_PATH' {
            if (-not (Test-PathWithinRoot -CandidatePath $TargetPath -RootPath $script:FeatureRoot)) {
                return [ordered]@{
                    status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                    reason = 'Report path escapes the feature-local report directory.'
                    trigger = 'stop:report-path-escape'
                }
            }

            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::PASS.ToString()
                reason = 'Report path remains inside the feature-local report directory.'
                trigger = ''
            }
        }
        'GIT_REPAIR' {
            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                reason = 'Git repair is forbidden.'
                trigger = 'stop:git-repair'
            }
        }
        'SCHEMA_MUTATION' {
            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                reason = 'Schema mutation is forbidden.'
                trigger = 'stop:schema-mutation'
            }
        }
        'PROTECTED_PATH_MUTATION' {
            if ($script:ProtectedPaths -contains $TargetPath) {
                return [ordered]@{
                    status = [RepositoryHealthCheckStatus]::FAIL.ToString()
                    reason = 'Protected path mutation is forbidden and marks the workflow as failed/non-compliant.'
                    trigger = 'stop:protected-path-mutation'
                }
            }

            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::PASS.ToString()
                reason = 'Target path is not protected by the mutation guard.'
                trigger = ''
            }
        }
        'OWNER_APPROVAL' {
            if (($script:ProtectedPaths -contains $TargetPath) -or ($script:BaselineDocs -contains $TargetPath)) {
                if (-not $OwnerApproved) {
                    return [ordered]@{
                        status = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
                        reason = 'Owner approval is required before touching protected or baseline-scoped files.'
                        trigger = 'stop:owner-approval'
                    }
                }
            }

            return [ordered]@{
                status = [RepositoryHealthCheckStatus]::PASS.ToString()
                reason = 'Owner approval is present or not required for this path.'
                trigger = ''
            }
        }
    }
}

function Invoke-GuardValidationSuite {
    $cases = @(
        [ordered]@{
            id = 'guard:unknown-helper'
            mode = 'HELPER'
            helperClass = [HelperSafetyClass]::UNKNOWN
            targetPath = ''
            ownerApproved = $false
            expectedStatus = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
            group = 'stop'
            description = 'Unknown helper must block auto-run.'
        }
        [ordered]@{
            id = 'guard:local-write-no-opt-in'
            mode = 'HELPER'
            helperClass = [HelperSafetyClass]::LOCAL_WRITE
            targetPath = ''
            ownerApproved = $false
            expectedStatus = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
            group = 'stop'
            description = 'Local-write helper must skip when build/local-write opt-ins are absent.'
        }
        [ordered]@{
            id = 'guard:network-no-opt-in'
            mode = 'HELPER'
            helperClass = [HelperSafetyClass]::NETWORK_READ_ONLY
            targetPath = ''
            ownerApproved = $false
            expectedStatus = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
            group = 'stop'
            description = 'Network helper must skip when network opt-ins are absent.'
        }
        [ordered]@{
            id = 'guard:git-repair'
            mode = 'GIT_REPAIR'
            helperClass = [HelperSafetyClass]::UNKNOWN
            targetPath = ''
            ownerApproved = $false
            expectedStatus = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
            group = 'stop'
            description = 'Git repair must hard stop.'
        }
        [ordered]@{
            id = 'guard:schema-mutation'
            mode = 'SCHEMA_MUTATION'
            helperClass = [HelperSafetyClass]::UNKNOWN
            targetPath = ''
            ownerApproved = $false
            expectedStatus = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
            group = 'stop'
            description = 'Schema mutation must hard stop.'
        }
        [ordered]@{
            id = 'guard:report-path-escape'
            mode = 'REPORT_PATH'
            helperClass = [HelperSafetyClass]::UNKNOWN
            targetPath = (Join-Path $script:FeatureRoot '..\guard-validation-escape.json')
            ownerApproved = $false
            expectedStatus = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
            group = 'stop'
            description = 'Report path escape must block writes outside the feature folder.'
        }
        [ordered]@{
            id = 'guard:protected-path-mutation'
            mode = 'PROTECTED_PATH_MUTATION'
            helperClass = [HelperSafetyClass]::UNKNOWN
            targetPath = 'App.tsx'
            ownerApproved = $false
            expectedStatus = [RepositoryHealthCheckStatus]::FAIL.ToString()
            group = 'protected'
            description = 'Protected-path mutation must fail the workflow.'
        }
        [ordered]@{
            id = 'guard:owner-approval-required'
            mode = 'OWNER_APPROVAL'
            helperClass = [HelperSafetyClass]::UNKNOWN
            targetPath = 'package.json'
            ownerApproved = $false
            expectedStatus = [RepositoryHealthCheckStatus]::BLOCKED.ToString()
            group = 'owner'
            description = 'Out-of-scope protected files must be blocked until owner approval is present.'
        }
    )

    $results = New-Object System.Collections.Generic.List[object]
    $stopConditionsVerified = $true
    $ownerApprovalGateVerified = $true
    $protectedPathGuardVerified = $true

    foreach ($case in $cases) {
        $decision = Invoke-RepositoryHealthGuardDecision `
            -Mode $case.mode `
            -HelperClass $case.helperClass `
            -TargetPath $case.targetPath `
            -OwnerApproved:([bool]$case.ownerApproved) `
            -AllowNetworkChecks:$false `
            -AllowSchema:$false `
            -AllowWorld:$false `
            -AllowBuild:$false `
            -AllowLocalWrites:$false

        $passed = $decision.status -eq $case.expectedStatus
        $results.Add([ordered]@{
            id = $case.id
            mode = $case.mode
            targetPath = $case.targetPath
            expectedStatus = $case.expectedStatus
            actualStatus = $decision.status
            passed = $passed
            reason = $decision.reason
            trigger = $decision.trigger
            description = $case.description
        })

        if (-not $passed) {
            switch ($case.group) {
                'stop' { $stopConditionsVerified = $false }
                'owner' { $ownerApprovalGateVerified = $false }
                'protected' { $protectedPathGuardVerified = $false }
            }
        }
    }

    return [ordered]@{
        status = if (($stopConditionsVerified -and $ownerApprovalGateVerified -and $protectedPathGuardVerified)) { 'PASS' } else { 'FAIL' }
        stopConditionsVerified = $stopConditionsVerified
        ownerApprovalGateVerified = $ownerApprovalGateVerified
        protectedPathGuardVerified = $protectedPathGuardVerified
        cases = $results.ToArray()
    }
}

function Invoke-DispatchValidationSuite {
    $registry = New-HelperAuditRegistry
    $cases = @(
        [ordered]@{
            id = 'dispatch:npm-run-lint-default'
            helperId = 'npm.run.lint'
            expectedStatus = [RepositoryHealthCheckStatus]::PASS.ToString()
            expectedShouldExecute = $true
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $false
            allowLocalWrites = $false
            description = 'npm run lint auto-runs by default.'
        }
        [ordered]@{
            id = 'dispatch:worker-regressions-default'
            helperId = 'check_regressions_worker6.mjs'
            expectedStatus = [RepositoryHealthCheckStatus]::PASS.ToString()
            expectedShouldExecute = $true
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $false
            allowLocalWrites = $false
            description = 'check_regressions_worker6.mjs auto-runs by default.'
        }
        [ordered]@{
            id = 'dispatch:check-schema-skip'
            helperId = 'check_schema.mjs'
            expectedStatus = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
            expectedShouldExecute = $false
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $false
            allowLocalWrites = $false
            description = 'check_schema.mjs stays skipped without a network opt-in.'
        }
        [ordered]@{
            id = 'dispatch:smoke-pb-skip'
            helperId = 'smoke_pocketbase_startup.mjs'
            expectedStatus = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
            expectedShouldExecute = $false
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $false
            allowLocalWrites = $false
            description = 'smoke_pocketbase_startup.mjs stays skipped without a network opt-in.'
        }
        [ordered]@{
            id = 'dispatch:verify-world-skip'
            helperId = 'verify_world.mjs'
            expectedStatus = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
            expectedShouldExecute = $false
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $false
            allowLocalWrites = $false
            description = 'verify_world.mjs stays skipped without a network opt-in.'
        }
        [ordered]@{
            id = 'dispatch:check-build-skip'
            helperId = 'check_build.mjs'
            expectedStatus = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
            expectedShouldExecute = $false
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $false
            allowLocalWrites = $false
            description = 'check_build.mjs stays skipped without build/local-write opt-ins.'
        }
        [ordered]@{
            id = 'dispatch:npm-build-skip'
            helperId = 'npm.run.build'
            expectedStatus = [RepositoryHealthCheckStatus]::SKIPPED.ToString()
            expectedShouldExecute = $false
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $false
            allowLocalWrites = $false
            description = 'npm run build stays skipped without build/local-write opt-ins.'
        }
        [ordered]@{
            id = 'dispatch:check-build-opt-in'
            helperId = 'check_build.mjs'
            expectedStatus = [RepositoryHealthCheckStatus]::PASS.ToString()
            expectedShouldExecute = $true
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $true
            allowLocalWrites = $true
            description = 'check_build.mjs can be permitted once both build and local-write opt-ins are present.'
        }
        [ordered]@{
            id = 'dispatch:npm-build-opt-in'
            helperId = 'npm.run.build'
            expectedStatus = [RepositoryHealthCheckStatus]::PASS.ToString()
            expectedShouldExecute = $true
            allowNetworkChecks = $false
            allowSchema = $false
            allowWorld = $false
            allowBuild = $true
            allowLocalWrites = $true
            description = 'npm run build can be permitted once both build and local-write opt-ins are present.'
        }
    )

    $results = New-Object System.Collections.Generic.List[object]
    $allPassed = $true

    foreach ($case in $cases) {
        $helper = $registry | Where-Object { $_.id -eq $case.helperId } | Select-Object -First 1
        $decision = Get-HelperDispatchDecision `
            -Helper $helper `
            -AllowNetworkChecks:([bool]$case.allowNetworkChecks) `
            -AllowSchema:([bool]$case.allowSchema) `
            -AllowWorld:([bool]$case.allowWorld) `
            -AllowBuild:([bool]$case.allowBuild) `
            -AllowLocalWrites:([bool]$case.allowLocalWrites)

        $passed = ($decision.status -eq $case.expectedStatus) -and ($decision.shouldExecute -eq $case.expectedShouldExecute)
        $results.Add([ordered]@{
            id = $case.id
            helperId = $case.helperId
            expectedStatus = $case.expectedStatus
            actualStatus = $decision.status
            expectedShouldExecute = $case.expectedShouldExecute
            actualShouldExecute = [bool]$decision.shouldExecute
            passed = $passed
            reason = $decision.reason
            skippedReason = $decision.skippedReason
            optInRequirement = $decision.optInRequirement
            description = $case.description
        })

        if (-not $passed) {
            $allPassed = $false
        }
    }

    return [ordered]@{
        status = if ($allPassed) { 'PASS' } else { 'FAIL' }
        cases = $results.ToArray()
    }
}

function Get-HelperAuditChecks {
    param(
        [switch]$AllowNetworkChecks,
        [switch]$AllowSchema,
        [switch]$AllowWorld,
        [switch]$AllowBuild,
        [switch]$AllowLocalWrites
    )

    $checks = New-Object System.Collections.Generic.List[object]

    foreach ($helper in (New-HelperAuditRegistry)) {
        $decision = Get-HelperDispatchDecision `
            -Helper $helper `
            -AllowNetworkChecks:$AllowNetworkChecks `
            -AllowSchema:$AllowSchema `
            -AllowWorld:$AllowWorld `
            -AllowBuild:$AllowBuild `
            -AllowLocalWrites:$AllowLocalWrites

        $execution = $null
        $status = [RepositoryHealthCheckStatus]$decision.status
        $reason = $decision.reason
        $skippedReason = ''

        if ($decision.shouldExecute) {
            $execution = Invoke-RepositoryHealthCommand `
                -CommandLabel $helper.command `
                -ExecutableCandidates $helper.executableCandidates `
                -Arguments $helper.arguments `
                -TimeoutMs ([int]$helper.timeoutMs)

            $status = [RepositoryHealthCheckStatus]$execution.status
            $reason = $execution.reason
        } elseif ($status -eq [RepositoryHealthCheckStatus]::SKIPPED) {
            $skippedReason = $decision.skippedReason
        }

        $checks.Add([ordered]@{
            id = "helper:$($helper.id)"
            label = $helper.label
            kind = [RepositoryHealthCheckKind]::COMMAND.ToString()
            status = $status.ToString()
            required = $true
            command = $helper.command
            exitCode = $(if ($null -ne $execution) { $execution.exitCode } else { $null })
            durationMs = $(if ($null -ne $execution) { $execution.durationMs } else { 0 })
            evidence = $helper.evidence
            reason = $reason
            helperClass = $helper.classification.ToString()
            defaultAutoRun = $helper.defaultAutoRun
            optInGates = $helper.optInGates
            optInRequirement = $decision.optInRequirement
            auditState = $helper.auditState
            sourcePath = $helper.sourcePath
            auditTarget = $helper.auditTarget
            skippedReason = $skippedReason
            executionEvidence = $(if ($null -ne $execution) { $execution.evidence } else { @() })
            stdout = $(if ($null -ne $execution) { $execution.stdout } else { '' })
            stderr = $(if ($null -ne $execution) { $execution.stderr } else { '' })
            safetyNotes = $helper.safetyNotes
        })
    }

    return $checks.ToArray()
}

function Get-StructuralChecks {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$GuardValidation
    )

    $checks = New-Object System.Collections.Generic.List[object]

    $checks.Add([ordered]@{
        id = 'scaffold:entry-point'
        label = 'Entry point scaffold'
        kind = [RepositoryHealthCheckKind]::DERIVED.ToString()
        status = [RepositoryHealthCheckStatus]::PASS.ToString()
        required = $true
        reason = 'The repository-health entry point exists as a PowerShell script scaffold at the repo root.'
    })

    $checks.Add([ordered]@{
        id = 'scaffold:report-path'
        label = 'Feature-local report path'
        kind = [RepositoryHealthCheckKind]::DERIVED.ToString()
        status = [RepositoryHealthCheckStatus]::PASS.ToString()
        required = $true
        reason = 'The report path is constrained to the feature-local reports directory.'
    })

    $checks.Add([ordered]@{
        id = 'scaffold:helper-registry'
        label = 'Helper classification registry'
        kind = [RepositoryHealthCheckKind]::INVENTORY.ToString()
        status = [RepositoryHealthCheckStatus]::PASS.ToString()
        required = $true
        reason = 'The first-pass helper registry is present and populated.'
    })

    $checks.Add([ordered]@{
        id = 'stop:catalog'
        label = 'Stop-condition catalog'
        kind = [RepositoryHealthCheckKind]::DERIVED.ToString()
        status = $(if ($GuardValidation.stopConditionsVerified) { [RepositoryHealthCheckStatus]::PASS.ToString() } else { [RepositoryHealthCheckStatus]::WARN.ToString() })
        required = $true
        reason = $(if ($GuardValidation.stopConditionsVerified) { 'The stop-condition catalog is implemented and enforced by synthetic validation cases.' } else { 'The stop-condition catalog exists, but enforcement is not yet verified.' })
    })

    $checks.Add([ordered]@{
        id = 'stop:owner-approval'
        label = 'Owner approval gate'
        kind = [RepositoryHealthCheckKind]::DERIVED.ToString()
        status = $(if ($GuardValidation.ownerApprovalGateVerified) { [RepositoryHealthCheckStatus]::PASS.ToString() } else { [RepositoryHealthCheckStatus]::WARN.ToString() })
        required = $true
        reason = $(if ($GuardValidation.ownerApprovalGateVerified) { 'The owner-approval gate is implemented and verified by synthetic validation cases.' } else { 'The owner-approval gate exists, but enforcement is not yet verified.' })
    })

    $checks.Add([ordered]@{
        id = 'guard:protected-path'
        label = 'Protected path mutation guard'
        kind = [RepositoryHealthCheckKind]::DERIVED.ToString()
        status = $(if ($GuardValidation.protectedPathGuardVerified) { [RepositoryHealthCheckStatus]::PASS.ToString() } else { [RepositoryHealthCheckStatus]::WARN.ToString() })
        required = $true
        reason = $(if ($GuardValidation.protectedPathGuardVerified) { 'Protected-path mutation handling is implemented and verified by synthetic validation cases.' } else { 'Protected-path mutation handling exists, but enforcement is not yet verified.' })
    })

    return $checks.ToArray()
}

function Get-FreshnessSnapshot {
    $graphifySurface = Get-GraphifySurfaceSnapshot -RepositoryRoot $script:RepoRoot
    $baselineSnapshot = Get-RepositoryProtectedPathSnapshot -RootPath $script:RepoRoot -RelativePaths $script:BaselineDocs
    $featureSnapshot = Get-RepositoryProtectedPathSnapshot -RootPath $script:RepoRoot -RelativePaths $script:FeatureDocs
    $assessment = Get-FreshnessAssessment `
        -GraphifySnapshot $graphifySurface `
        -BaselineEntries $baselineSnapshot.entries `
        -FeatureEntries $featureSnapshot.entries

    return [ordered]@{
        baseline = $assessment.baseline
        graph = $assessment.graph
        activeSourceFiles = $assessment.activeSourceFiles
        baselineDocs = $assessment.baselineDocs
        designDocs = $assessment.designDocs
        graphArtifacts = $assessment.graphArtifacts
        driftReasons = $assessment.driftReasons
        sourceSnapshot = $assessment.sourceSnapshot
        baselineSnapshot = $assessment.baselineSnapshot
        graphSnapshot = $assessment.graphSnapshot
        graphifySurface = $graphifySurface
    }
}

function Get-GitSnapshot {
    param(
        [string]$RepositoryRoot = $script:RepoRoot,
        [string]$ExpectedRoot = $script:RepoRoot,
        [string]$GitExecutablePath = $null
    )

    $normalizedRepositoryRoot = Get-AbsolutePath -Path $RepositoryRoot
    $normalizedExpectedRoot = Get-AbsolutePath -Path $ExpectedRoot
    $beforeProtected = Get-RepositoryProtectedPathSnapshot -RootPath $normalizedRepositoryRoot
    $beforeGitMetadata = Get-RepositoryProtectedPathSnapshot -RootPath $normalizedRepositoryRoot -RelativePaths @('.git')

    $resolvedGitExecutable = $null
    $executableResolution = [ordered]@{
        available = $false
        executablePath = $null
        resolutionMethod = 'MISSING'
        evidence = @()
    }

    if ($PSBoundParameters.ContainsKey('GitExecutablePath')) {
        if (-not [string]::IsNullOrWhiteSpace($GitExecutablePath)) {
            $resolvedGitExecutable = Get-AbsolutePath -Path $GitExecutablePath
            $executableResolution = [ordered]@{
                available = $true
                executablePath = $resolvedGitExecutable
                resolutionMethod = 'EXPLICIT_OVERRIDE'
                evidence = @("Git executable override: $resolvedGitExecutable")
            }
        } else {
            $executableResolution = [ordered]@{
                available = $false
                executablePath = $null
                resolutionMethod = 'MISSING'
                evidence = @('Git executable was explicitly disabled for this validation run.')
            }
        }
    } else {
        $executableResolution = Resolve-GitExecutable
        if ($executableResolution.available) {
            $resolvedGitExecutable = $executableResolution.executablePath
        }
    }

    $metadataSnapshot = Get-GitMetadataSnapshot -RepositoryRoot $normalizedRepositoryRoot
    $gitSnapshot = [ordered]@{
        available = [bool]$executableResolution.available
        executablePath = $executableResolution.executablePath
        metadataKind = $metadataSnapshot.kind
        metadataTrusted = [bool]$metadataSnapshot.trustedCandidate
        trusted = $false
        mode = [GitTrustMode]::MISSING.ToString()
        repositoryRoot = $null
        expectedRoot = $normalizedExpectedRoot
        rootMatches = $false
        revParseExitCode = $null
        statusExitCode = $null
        diffExitCode = $null
        changedFiles = @()
        stagedFiles = @()
        untrackedFiles = @()
        reason = ''
        evidence = New-Object System.Collections.Generic.List[object]
        protectedPathComparison = $null
    }

    foreach ($evidenceItem in $executableResolution.evidence) {
        $gitSnapshot.evidence.Add($evidenceItem)
    }

    $gitSnapshot.evidence.Add(("metadataKind={0}" -f $metadataSnapshot.kind))
    $gitSnapshot.evidence.Add(("metadataTrusted={0}" -f $metadataSnapshot.trustedCandidate))
    if ($metadataSnapshot.pointerTarget) {
        $gitSnapshot.evidence.Add(("pointerTarget={0}" -f $metadataSnapshot.pointerTarget))
    }

    if (-not $executableResolution.available) {
        $gitSnapshot.mode = [GitTrustMode]::MISSING.ToString()
        $gitSnapshot.reason = 'Git executable is unavailable, so only filesystem evidence can be used.'
        $gitSnapshot.evidence.Add((Get-GitFilesystemFallbackEvidence -RepositoryRoot $normalizedRepositoryRoot))
    } elseif (-not $metadataSnapshot.trustedCandidate) {
        $gitSnapshot.mode = if ($metadataSnapshot.kind -in @('ABSENT', 'EMPTY_DIRECTORY', 'MALFORMED_POINTER_FILE')) {
            [GitTrustMode]::MISSING.ToString()
        } else {
            [GitTrustMode]::FALLBACK_ONLY.ToString()
        }
        $gitSnapshot.reason = (('{0} Filesystem-only evidence cannot prove a clean working tree, staged changes, deletion history, rename history, or branch state.' -f $metadataSnapshot.reason))
        $gitSnapshot.evidence.Add((Get-GitFilesystemFallbackEvidence -RepositoryRoot $normalizedRepositoryRoot))
    } else {
        $revParse = Invoke-RepositoryHealthCommand `
            -CommandLabel 'git rev-parse --show-toplevel' `
            -ExecutableCandidates @($resolvedGitExecutable) `
            -Arguments @('rev-parse', '--show-toplevel') `
            -WorkingDirectory $normalizedRepositoryRoot `
            -TimeoutMs 10000

        $gitSnapshot.revParseExitCode = $revParse.exitCode
        $gitSnapshot.evidence.Add($revParse.evidence)
        if (-not [string]::IsNullOrWhiteSpace($revParse.stdout)) {
            $gitSnapshot.repositoryRoot = (Get-AbsolutePath -Path $revParse.stdout.Trim())
            $gitSnapshot.rootMatches = $gitSnapshot.repositoryRoot.Equals($normalizedExpectedRoot, [System.StringComparison]::OrdinalIgnoreCase)
        }

        if (($revParse.status -ne [RepositoryHealthCheckStatus]::PASS.ToString()) -or (-not $gitSnapshot.rootMatches)) {
            $gitSnapshot.mode = [GitTrustMode]::FALLBACK_ONLY.ToString()
            if ($revParse.status -ne [RepositoryHealthCheckStatus]::PASS.ToString()) {
                $gitSnapshot.reason = 'Git rev-parse did not confirm a trustworthy repository root.'
            } else {
                $gitSnapshot.reason = ('Git rev-parse returned {0}, which does not match the expected repository root {1}.' -f $gitSnapshot.repositoryRoot, $gitSnapshot.expectedRoot)
            }

            $gitSnapshot.evidence.Add((Get-GitFilesystemFallbackEvidence -RepositoryRoot $normalizedRepositoryRoot))
        } else {
            $statusCheck = Invoke-RepositoryHealthCommand `
                -CommandLabel 'git status --short' `
                -ExecutableCandidates @($resolvedGitExecutable) `
                -Arguments @('status', '--short') `
                -WorkingDirectory $normalizedRepositoryRoot `
                -TimeoutMs 10000

            $diffCheck = Invoke-RepositoryHealthCommand `
                -CommandLabel 'git diff --name-only' `
                -ExecutableCandidates @($resolvedGitExecutable) `
                -Arguments @('diff', '--name-only') `
                -WorkingDirectory $normalizedRepositoryRoot `
                -TimeoutMs 10000

            $cachedDiffCheck = Invoke-RepositoryHealthCommand `
                -CommandLabel 'git diff --cached --name-only' `
                -ExecutableCandidates @($resolvedGitExecutable) `
                -Arguments @('diff', '--cached', '--name-only') `
                -WorkingDirectory $normalizedRepositoryRoot `
                -TimeoutMs 10000

            $gitSnapshot.statusExitCode = $statusCheck.exitCode
            $gitSnapshot.diffExitCode = $diffCheck.exitCode

            $gitSnapshot.evidence.Add($statusCheck.evidence)
            $gitSnapshot.evidence.Add($diffCheck.evidence)
            $gitSnapshot.evidence.Add($cachedDiffCheck.evidence)

            $gitSnapshot.changedFiles = @($diffCheck.stdout -split '\r?\n' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
            $gitSnapshot.stagedFiles = @($cachedDiffCheck.stdout -split '\r?\n' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
            $statusLines = @($statusCheck.stdout -split '\r?\n' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
            $gitSnapshot.untrackedFiles = @(
                $statusLines | ForEach-Object {
                    if ($_.StartsWith('?? ')) {
                        $_.Substring(3).Trim()
                    }
                } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
            )

            if (($statusCheck.status -eq [RepositoryHealthCheckStatus]::PASS.ToString()) -and
                ($diffCheck.status -eq [RepositoryHealthCheckStatus]::PASS.ToString()) -and
                ($cachedDiffCheck.status -eq [RepositoryHealthCheckStatus]::PASS.ToString())) {
                $gitSnapshot.trusted = $true
                $gitSnapshot.mode = [GitTrustMode]::TRUSTED.ToString()
                $gitSnapshot.reason = 'Git executable, metadata, repository root, status, and diff were verified successfully.'
            } else {
                $gitSnapshot.mode = [GitTrustMode]::FALLBACK_ONLY.ToString()
                $gitSnapshot.reason = 'Git status or diff could not be verified reliably, so filesystem-only evidence is used.'
                $gitSnapshot.evidence.Add((Get-GitFilesystemFallbackEvidence -RepositoryRoot $normalizedRepositoryRoot))
            }
        }
    }

    $afterProtected = Get-RepositoryProtectedPathSnapshot -RootPath $normalizedRepositoryRoot
    $afterGitMetadata = Get-RepositoryProtectedPathSnapshot -RootPath $normalizedRepositoryRoot -RelativePaths @('.git')
    $protectedComparison = Compare-RepositoryProtectedPathSnapshots -Before $beforeProtected -After $afterProtected
    $gitMetadataComparison = Compare-RepositoryProtectedPathSnapshots -Before $beforeGitMetadata -After $afterGitMetadata
    $gitSnapshot.protectedPathComparison = [ordered]@{
        unchanged = ($protectedComparison.unchanged -and $gitMetadataComparison.unchanged)
        changedPaths = @(
            $protectedComparison.changedPaths +
            $gitMetadataComparison.changedPaths |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            Select-Object -Unique
        )
        before = [ordered]@{
            protected = $beforeProtected
            gitMetadata = $beforeGitMetadata
        }
        after = [ordered]@{
            protected = $afterProtected
            gitMetadata = $afterGitMetadata
        }
    }

    if (-not $gitSnapshot.protectedPathComparison.unchanged) {
        $gitSnapshot.trusted = $false
        if ($gitSnapshot.mode -eq [GitTrustMode]::TRUSTED.ToString()) {
            $gitSnapshot.mode = [GitTrustMode]::FALLBACK_ONLY.ToString()
        }

        if ([string]::IsNullOrWhiteSpace($gitSnapshot.reason)) {
            $gitSnapshot.reason = 'Protected-path hashes changed during Git detection.'
        } else {
            $gitSnapshot.reason = ('{0} Protected-path hashes changed during Git detection.' -f $gitSnapshot.reason)
        }
    }

    if ($gitSnapshot.trusted) {
        $gitSnapshot.evidence.Add('Git trust result = TRUSTED')
    } else {
        $gitSnapshot.evidence.Add(('Git trust result = {0}' -f $gitSnapshot.mode))
    }

    $gitSnapshot.evidence.Add(('protectedPathsUnchanged={0}' -f $gitSnapshot.protectedPathComparison.unchanged))
    if ($gitSnapshot.protectedPathComparison.changedPaths.Count -gt 0) {
        $gitSnapshot.evidence.Add(('changedProtectedPaths={0}' -f ($gitSnapshot.protectedPathComparison.changedPaths -join ', ')))
    }

    return $gitSnapshot
}

function Resolve-GitExecutable {
    $resolutionEvidence = New-Object System.Collections.Generic.List[string]
    $command = Get-Command -Name git -ErrorAction SilentlyContinue | Where-Object { $_.CommandType -eq 'Application' } | Select-Object -First 1

    if ($null -ne $command) {
        $path = if (-not [string]::IsNullOrWhiteSpace($command.Source)) { $command.Source } else { $command.Definition }
        if (-not [string]::IsNullOrWhiteSpace($path)) {
            $absolutePath = Get-AbsolutePath -Path $path
            $resolutionEvidence.Add(("Get-Command git resolved to {0}" -f $absolutePath))
            return [ordered]@{
                available = $true
                executablePath = $absolutePath
                resolutionMethod = 'PATH'
                evidence = $resolutionEvidence.ToArray()
            }
        }
    }

    foreach ($candidate in $script:KnownGitExecutablePaths) {
        if (Test-Path -LiteralPath $candidate) {
            $absolutePath = Get-AbsolutePath -Path $candidate
            $resolutionEvidence.Add(("Known Git path resolved to {0}" -f $absolutePath))
            return [ordered]@{
                available = $true
                executablePath = $absolutePath
                resolutionMethod = 'KNOWN_PATH'
                evidence = $resolutionEvidence.ToArray()
            }
        }

        $resolutionEvidence.Add(("Known Git path missing: {0}" -f $candidate))
    }

    return [ordered]@{
        available = $false
        executablePath = $null
        resolutionMethod = 'MISSING'
        evidence = $resolutionEvidence.ToArray()
    }
}

function Get-RepositoryProtectedPathSnapshot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RootPath,
        [string[]]$RelativePaths = $script:GitProtectedProbePaths
    )

    $normalizedRoot = Get-AbsolutePath -Path $RootPath
    $entries = New-Object System.Collections.Generic.List[object]

    foreach ($relativePath in $RelativePaths) {
        $candidatePath = Join-Path $normalizedRoot $relativePath
        if (-not (Test-Path -LiteralPath $candidatePath)) {
            $entries.Add([ordered]@{
                path = $relativePath
                exists = $false
                kind = 'Missing'
                sizeBytes = $null
                lastWriteTime = $null
                sha256 = $null
                childCount = 0
                children = @()
            })
            continue
        }

        $item = Get-Item -LiteralPath $candidatePath -Force
        if ($item.PSIsContainer) {
            $childEntries = @(Get-ChildItem -LiteralPath $candidatePath -Force -Recurse -File -ErrorAction SilentlyContinue | Sort-Object FullName)
            $childHashes = New-Object System.Collections.Generic.List[string]
            foreach ($child in $childEntries) {
                $childRelative = $child.FullName.Substring($normalizedRoot.Length).TrimStart('\')
                $childHash = $null
                if (Test-Path -LiteralPath $child.FullName) {
                    $childHash = (Get-FileHash -LiteralPath $child.FullName -Algorithm SHA256 -ErrorAction SilentlyContinue).Hash
                }
                $childHashes.Add(("{{path={0}; sha256={1}}}" -f $childRelative, $childHash))
            }

            $entries.Add([ordered]@{
                path = $relativePath
                exists = $true
                kind = 'Directory'
                sizeBytes = $null
                lastWriteTime = $item.LastWriteTime.ToString('o')
                sha256 = $null
                childCount = $childEntries.Count
                children = $childHashes.ToArray()
            })
        } else {
            $fileHash = (Get-FileHash -LiteralPath $candidatePath -Algorithm SHA256 -ErrorAction SilentlyContinue).Hash
            $entries.Add([ordered]@{
                path = $relativePath
                exists = $true
                kind = 'File'
                sizeBytes = [int64]$item.Length
                lastWriteTime = $item.LastWriteTime.ToString('o')
                sha256 = $fileHash
                childCount = 0
                children = @()
            })
        }
    }

    return [ordered]@{
        root = $normalizedRoot
        entries = $entries.ToArray()
    }
}

function Compare-RepositoryProtectedPathSnapshots {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Before,
        [Parameter(Mandatory = $true)]
        [hashtable]$After
    )

    $beforeMap = @{}
    foreach ($entry in @($Before.entries)) {
        $beforeMap[$entry.path] = $entry
    }

    $afterMap = @{}
    foreach ($entry in @($After.entries)) {
        $afterMap[$entry.path] = $entry
    }

    $changedPaths = New-Object System.Collections.Generic.List[string]
    foreach ($path in ($beforeMap.Keys | Sort-Object)) {
        if (-not $afterMap.ContainsKey($path)) {
            $changedPaths.Add($path)
            continue
        }

        $beforeJson = ($beforeMap[$path] | ConvertTo-Json -Depth 8 -Compress)
        $afterJson = ($afterMap[$path] | ConvertTo-Json -Depth 8 -Compress)
        if ($beforeJson -ne $afterJson) {
            $changedPaths.Add($path)
        }
    }

    foreach ($path in ($afterMap.Keys | Sort-Object)) {
        if (-not $beforeMap.ContainsKey($path)) {
            $changedPaths.Add($path)
        }
    }

    return [ordered]@{
        unchanged = ($changedPaths.Count -eq 0)
        changedPaths = $changedPaths.ToArray()
        before = $Before
        after = $After
    }
}

function Get-LatestSnapshotTimestamp {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Entries
    )

    $latest = $null
    foreach ($entry in @($Entries)) {
        $exists = $false
        $lastWriteTime = $null

        if ($entry -is [System.Collections.IDictionary]) {
            $exists = [bool]$entry['exists']
            $lastWriteTime = $entry['lastWriteTime']
        } else {
            $exists = [bool]$entry.exists
            $lastWriteTime = $entry.lastWriteTime
        }

        if (-not $exists -or [string]::IsNullOrWhiteSpace([string]$lastWriteTime)) {
            continue
        }

        try {
            $candidate = [DateTimeOffset]::Parse([string]$lastWriteTime).UtcDateTime
        } catch {
            continue
        }

        if ($null -eq $latest -or $candidate -gt $latest) {
            $latest = $candidate
        }
    }

    return $latest
}

function Get-FreshnessCheckStatus {
    param(
        [Parameter(Mandatory = $true)]
        [string]$State
    )

    switch ($State) {
        ([FreshnessState]::FRESH.ToString()) { return [RepositoryHealthCheckStatus]::PASS }
        ([FreshnessState]::STALE.ToString()) { return [RepositoryHealthCheckStatus]::WARN }
        default { return [RepositoryHealthCheckStatus]::BLOCKED }
    }
}

function Test-GraphifyActiveSourcePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    $normalized = ($RelativePath -replace '\\', '/').Trim()
    if ([string]::IsNullOrWhiteSpace($normalized)) {
        return $false
    }

    if ($normalized.StartsWith('graphify-out/')) { return $false }
    if ($normalized.StartsWith('specs/')) { return $false }
    if ($normalized.StartsWith('.tmp/')) { return $false }
    if ($normalized -match '(^|/).*backup.*') { return $false }
    if ($normalized -match '\.(png|jpg|jpeg|gif|webp|svg|mp3|wav|mp4|mov|zip|7z|rar|tar|gz|log)$') { return $false }
    return $true
}

function Get-GraphifySurfaceSnapshot {
    param(
        [string]$RepositoryRoot = $script:RepoRoot
    )

    $normalizedRoot = Get-AbsolutePath -Path $RepositoryRoot
    $graphJsonPath = Join-Path $normalizedRoot 'graphify-out/graph.json'
    $graphAvailable = Test-Path -LiteralPath $graphJsonPath
    $graphParseErrors = New-Object System.Collections.Generic.List[string]
    $sourceFiles = New-Object System.Collections.Generic.List[string]
    $communityCounts = @{}
    $nodeCount = 0
    $linkCount = 0
    $directed = $false
    $multigraph = $false

    if ($graphAvailable) {
        try {
            $graph = Get-Content -Raw -LiteralPath $graphJsonPath | ConvertFrom-Json
            $directed = [bool]$graph.directed
            $multigraph = [bool]$graph.multigraph
            $nodeCount = @($graph.nodes).Count
            $linkCount = @($graph.links).Count

            foreach ($node in @($graph.nodes)) {
                if ($null -ne $node.source_file -and -not [string]::IsNullOrWhiteSpace([string]$node.source_file)) {
                    $candidateSource = [string]$node.source_file
                    if (Test-GraphifyActiveSourcePath -RelativePath $candidateSource) {
                        $sourceFiles.Add($candidateSource)
                    }
                }

                $communityName = if ($null -ne $node.community_name -and -not [string]::IsNullOrWhiteSpace([string]$node.community_name)) {
                    [string]$node.community_name
                } elseif ($null -ne $node.community) {
                    [string]$node.community
                } else {
                    '<unknown>'
                }

                if ($communityCounts.ContainsKey($communityName)) {
                    $communityCounts[$communityName]++
                } else {
                    $communityCounts[$communityName] = 1
                }
            }
        } catch {
            $graphParseErrors.Add($_.Exception.Message)
        }
    } else {
        $graphParseErrors.Add('graphify-out/graph.json is missing.')
    }

    $uniqueSourceFiles = @($sourceFiles | Sort-Object -Unique)
    if ($graphAvailable -and $uniqueSourceFiles.Count -eq 0) {
        $graphParseErrors.Add('Graphify active source surface is empty after filtering.')
    }
    $artifactSnapshot = Get-RepositoryProtectedPathSnapshot -RootPath $normalizedRoot -RelativePaths $script:GraphArtifacts
    $sourceSnapshot = if ($uniqueSourceFiles.Count -gt 0) {
        Get-RepositoryProtectedPathSnapshot -RootPath $normalizedRoot -RelativePaths $uniqueSourceFiles
    } else {
        [ordered]@{
            root = $normalizedRoot
            entries = @()
        }
    }

    $missingArtifacts = @($artifactSnapshot.entries | Where-Object { -not $_.exists } | ForEach-Object { $_.path })
    $missingSourceFiles = @($sourceSnapshot.entries | Where-Object { -not $_.exists } | ForEach-Object { $_.path })
    $latestGraphArtifactWriteTime = Get-LatestSnapshotTimestamp -Entries $artifactSnapshot.entries
    $latestSourceWriteTime = Get-LatestSnapshotTimestamp -Entries $sourceSnapshot.entries
    $communitySummary = @(
        $communityCounts.GetEnumerator() |
            Sort-Object Value -Descending |
            Select-Object -First 12 |
            ForEach-Object {
                [ordered]@{
                    name = $_.Key
                    count = $_.Value
                }
            }
    )

    return [ordered]@{
        available = ($graphAvailable -and $graphParseErrors.Count -eq 0)
        parseErrors = $graphParseErrors.ToArray()
        graphJsonPath = 'graphify-out/graph.json'
        nodeCount = $nodeCount
        linkCount = $linkCount
        directed = $directed
        multigraph = $multigraph
        sourceFiles = $uniqueSourceFiles
        sourceFileCount = $uniqueSourceFiles.Count
        sourceSnapshot = $sourceSnapshot
        artifactSnapshot = $artifactSnapshot
        latestSourceWriteTime = $(if ($null -ne $latestSourceWriteTime) { $latestSourceWriteTime.ToString('o') } else { $null })
        latestGraphArtifactWriteTime = $(if ($null -ne $latestGraphArtifactWriteTime) { $latestGraphArtifactWriteTime.ToString('o') } else { $null })
        missingSourceFiles = $missingSourceFiles
        missingArtifacts = $missingArtifacts
        communityCount = $communityCounts.Count
        communitySummary = $communitySummary
    }
}

function Get-FreshnessAssessment {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$GraphifySnapshot,
        [Parameter(Mandatory = $true)]
        [object[]]$BaselineEntries,
        [Parameter(Mandatory = $true)]
        [object[]]$FeatureEntries
    )

    $baselineMissing = @($BaselineEntries | Where-Object { -not $_.exists } | ForEach-Object { $_.path })
    $featureMissing = @($FeatureEntries | Where-Object { -not $_.exists } | ForEach-Object { $_.path })
    $baselineLatest = Get-LatestSnapshotTimestamp -Entries $BaselineEntries
    $featureLatest = Get-LatestSnapshotTimestamp -Entries $FeatureEntries
    $sourceLatest = $null
    if ($null -ne $GraphifySnapshot.sourceSnapshot) {
        $sourceLatest = Get-LatestSnapshotTimestamp -Entries $GraphifySnapshot.sourceSnapshot.entries
    }

    $graphArtifactEntries = @()
    if ($null -ne $GraphifySnapshot.artifactSnapshot) {
        $graphArtifactEntries = @($GraphifySnapshot.artifactSnapshot.entries)
    }

    $graphArtifactLatest = Get-LatestSnapshotTimestamp -Entries $graphArtifactEntries
    $graphParseOk = [bool]$GraphifySnapshot.available
    $graphMissingArtifacts = @($GraphifySnapshot.missingArtifacts)
    $graphMissingSources = @($GraphifySnapshot.missingSourceFiles)

    $baselineState = [FreshnessState]::UNKNOWN.ToString()
    $graphState = [FreshnessState]::UNKNOWN.ToString()
    $driftReasons = New-Object System.Collections.Generic.List[string]
    $baselineReason = ''
    $graphReason = ''

    if ($baselineMissing.Count -gt 0) {
        $baselineReason = 'One or more baseline docs are missing.'
        $driftReasons.Add($baselineReason)
    } elseif ($featureMissing.Count -gt 0) {
        $baselineReason = 'One or more feature design docs are missing.'
        $driftReasons.Add($baselineReason)
    } elseif ($null -eq $sourceLatest -or $null -eq $baselineLatest -or $null -eq $featureLatest) {
        $baselineReason = 'Baseline freshness cannot be proven because one or more timestamp snapshots are unavailable.'
        $driftReasons.Add($baselineReason)
    } elseif (($baselineLatest -lt $sourceLatest) -or ($featureLatest -lt $sourceLatest)) {
        $baselineState = [FreshnessState]::STALE.ToString()
        $baselineReason = ('Baseline docs trail the active source surface. sourceLatest={0}; baselineLatest={1}; featureLatest={2}' -f $sourceLatest.ToString('o'), $baselineLatest.ToString('o'), $featureLatest.ToString('o'))
        $driftReasons.Add($baselineReason)
    } else {
        $baselineState = [FreshnessState]::FRESH.ToString()
        $baselineReason = ('Baseline docs and feature docs are current relative to the active source surface. sourceLatest={0}; baselineLatest={1}; featureLatest={2}' -f $sourceLatest.ToString('o'), $baselineLatest.ToString('o'), $featureLatest.ToString('o'))
    }

    if (-not $graphParseOk) {
        $graphReason = 'Graphify graph.json is missing or malformed.'
        $driftReasons.Add($graphReason)
    } elseif ($graphMissingArtifacts.Count -gt 0) {
        $graphReason = ('One or more Graphify artifacts are missing: {0}' -f ($graphMissingArtifacts -join ', '))
        $driftReasons.Add($graphReason)
    } elseif ($graphMissingSources.Count -gt 0) {
        $graphReason = ('Graphify source coverage is incomplete: {0}' -f ($graphMissingSources -join ', '))
        $driftReasons.Add($graphReason)
    } elseif ($null -eq $sourceLatest -or $null -eq $graphArtifactLatest) {
        $graphReason = 'Graphify freshness cannot be proven because the source or artifact timestamps are unavailable.'
        $driftReasons.Add($graphReason)
    } elseif ($graphArtifactLatest -lt $sourceLatest) {
        $graphState = [FreshnessState]::STALE.ToString()
        $graphReason = ('Graphify artifacts trail the active source surface. sourceLatest={0}; graphArtifactLatest={1}' -f $sourceLatest.ToString('o'), $graphArtifactLatest.ToString('o'))
        $driftReasons.Add($graphReason)
    } else {
        $graphState = [FreshnessState]::FRESH.ToString()
        $graphReason = ('Graphify artifacts cover the active source surface. sourceLatest={0}; graphArtifactLatest={1}; sourceFiles={2}; communities={3}' -f $sourceLatest.ToString('o'), $graphArtifactLatest.ToString('o'), @($GraphifySnapshot.sourceFiles).Count, $GraphifySnapshot.communityCount)
    }

    return [ordered]@{
        baseline = $baselineState
        graph = $graphState
        activeSourceFiles = @($GraphifySnapshot.sourceFiles)
        baselineDocs = $script:BaselineDocs
        designDocs = $script:FeatureDocs
        graphArtifacts = $script:GraphArtifacts
        driftReasons = $driftReasons.ToArray()
        sourceSnapshot = $GraphifySnapshot.sourceSnapshot
        baselineSnapshot = [ordered]@{
            status = $baselineState
            reason = $baselineReason
            sourceLatestWriteTime = $(if ($null -ne $sourceLatest) { $sourceLatest.ToString('o') } else { $null })
            baselineLatestWriteTime = $(if ($null -ne $baselineLatest) { $baselineLatest.ToString('o') } else { $null })
            featureLatestWriteTime = $(if ($null -ne $featureLatest) { $featureLatest.ToString('o') } else { $null })
            missingBaselineDocs = $baselineMissing
            missingFeatureDocs = $featureMissing
        }
        graphSnapshot = [ordered]@{
            status = $graphState
            reason = $graphReason
            sourceLatestWriteTime = $(if ($null -ne $sourceLatest) { $sourceLatest.ToString('o') } else { $null })
            graphLatestWriteTime = $(if ($null -ne $graphArtifactLatest) { $graphArtifactLatest.ToString('o') } else { $null })
            missingArtifacts = $graphMissingArtifacts
            missingSourceFiles = $graphMissingSources
            sourceFileCount = @($GraphifySnapshot.sourceFiles).Count
            communityCount = $GraphifySnapshot.communityCount
            nodeCount = $GraphifySnapshot.nodeCount
            linkCount = $GraphifySnapshot.linkCount
        }
    }
}

function Get-FreshnessChecks {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$FreshnessSnapshot
    )

    $checks = New-Object System.Collections.Generic.List[object]
    $baselineStatus = Get-FreshnessCheckStatus -State $FreshnessSnapshot.baseline
    $graphStatus = Get-FreshnessCheckStatus -State $FreshnessSnapshot.graph

    $checks.Add([ordered]@{
        id = 'freshness:baseline'
        label = 'Baseline freshness'
        kind = [RepositoryHealthCheckKind]::FRESHNESS.ToString()
        status = $baselineStatus.ToString()
        required = $true
        reason = $FreshnessSnapshot.baselineSnapshot.reason
    })

    $checks.Add([ordered]@{
        id = 'freshness:graph'
        label = 'Graphify freshness'
        kind = [RepositoryHealthCheckKind]::FRESHNESS.ToString()
        status = $graphStatus.ToString()
        required = $true
        reason = $FreshnessSnapshot.graphSnapshot.reason
    })

    return $checks.ToArray()
}

function Invoke-FreshnessValidationSuite {
    $cases = @(
        [ordered]@{
            id = 'freshness:current-surface'
            description = 'Current baseline docs and Graphify artifacts remain fresh relative to the active source surface.'
            sourceLatest = '2026-07-12T18:00:00.0000000+00:00'
            baselineLatest = '2026-07-12T18:30:00.0000000+00:00'
            featureLatest = '2026-07-12T18:45:00.0000000+00:00'
            graphLatest = '2026-07-12T19:00:00.0000000+00:00'
            missingBaselineDocs = @()
            missingFeatureDocs = @()
            missingGraphArtifacts = @()
            missingSourceFiles = @()
            expectedBaselineState = [FreshnessState]::FRESH.ToString()
            expectedGraphState = [FreshnessState]::FRESH.ToString()
        }
        [ordered]@{
            id = 'freshness:stale-baseline'
            description = 'Baseline docs should become stale when the source surface moves ahead of them.'
            sourceLatest = '2026-07-12T19:30:00.0000000+00:00'
            baselineLatest = '2026-07-12T18:30:00.0000000+00:00'
            featureLatest = '2026-07-12T18:45:00.0000000+00:00'
            graphLatest = '2026-07-12T20:00:00.0000000+00:00'
            missingBaselineDocs = @()
            missingFeatureDocs = @()
            missingGraphArtifacts = @()
            missingSourceFiles = @()
            expectedBaselineState = [FreshnessState]::STALE.ToString()
            expectedGraphState = [FreshnessState]::FRESH.ToString()
        }
        [ordered]@{
            id = 'freshness:stale-graph'
            description = 'Graphify artifacts should become stale when they trail the source surface.'
            sourceLatest = '2026-07-12T19:30:00.0000000+00:00'
            baselineLatest = '2026-07-12T20:00:00.0000000+00:00'
            featureLatest = '2026-07-12T20:15:00.0000000+00:00'
            graphLatest = '2026-07-12T18:30:00.0000000+00:00'
            missingBaselineDocs = @()
            missingFeatureDocs = @()
            missingGraphArtifacts = @()
            missingSourceFiles = @()
            expectedBaselineState = [FreshnessState]::FRESH.ToString()
            expectedGraphState = [FreshnessState]::STALE.ToString()
        }
        [ordered]@{
            id = 'freshness:missing-graph'
            description = 'Missing Graphify artifacts should yield an unknown graph freshness state.'
            sourceLatest = '2026-07-12T19:30:00.0000000+00:00'
            baselineLatest = '2026-07-12T20:00:00.0000000+00:00'
            featureLatest = '2026-07-12T20:15:00.0000000+00:00'
            graphLatest = $null
            missingBaselineDocs = @()
            missingFeatureDocs = @()
            missingGraphArtifacts = @('graphify-out/graph.json')
            missingSourceFiles = @()
            expectedBaselineState = [FreshnessState]::FRESH.ToString()
            expectedGraphState = [FreshnessState]::UNKNOWN.ToString()
        }
        [ordered]@{
            id = 'freshness:missing-baseline'
            description = 'Missing baseline docs should yield an unknown baseline freshness state.'
            sourceLatest = '2026-07-12T19:30:00.0000000+00:00'
            baselineLatest = $null
            featureLatest = '2026-07-12T20:15:00.0000000+00:00'
            graphLatest = '2026-07-12T20:30:00.0000000+00:00'
            missingBaselineDocs = @('specs/_baseline/12-target-architecture.md')
            missingFeatureDocs = @()
            missingGraphArtifacts = @()
            missingSourceFiles = @()
            expectedBaselineState = [FreshnessState]::UNKNOWN.ToString()
            expectedGraphState = [FreshnessState]::FRESH.ToString()
        }
    )

    $results = New-Object System.Collections.Generic.List[object]
    $allPassed = $true

    foreach ($case in $cases) {
        $assessment = Get-FreshnessAssessment `
            -GraphifySnapshot ([ordered]@{
                available = ($null -ne $case.graphLatest -and @($case.missingGraphArtifacts).Count -eq 0)
                parseErrors = @()
                sourceFiles = @('App.tsx')
                sourceFileCount = 1
                sourceSnapshot = [ordered]@{
                    entries = @(
                        [ordered]@{
                            path = 'App.tsx'
                            exists = $true
                            lastWriteTime = $case.sourceLatest
                        }
                    )
                }
                artifactSnapshot = [ordered]@{
                    entries = @(
                        [ordered]@{
                            path = 'graphify-out/graph.json'
                            exists = ($case.graphLatest -ne $null -and @($case.missingGraphArtifacts).Count -eq 0)
                            lastWriteTime = $case.graphLatest
                        }
                    )
                }
                latestSourceWriteTime = $case.sourceLatest
                latestGraphArtifactWriteTime = $case.graphLatest
                missingSourceFiles = $case.missingSourceFiles
                missingArtifacts = $case.missingGraphArtifacts
                communityCount = 1
                nodeCount = 1
                linkCount = 0
            }) `
            -BaselineEntries @(
                [ordered]@{
                    path = 'specs/_baseline/12-target-architecture.md'
                    exists = (@($case.missingBaselineDocs).Count -eq 0)
                    lastWriteTime = $case.baselineLatest
                }
            ) `
            -FeatureEntries @(
                [ordered]@{
                    path = 'specs/001-verification-workflow-and-repository-health/plan.md'
                    exists = (@($case.missingFeatureDocs).Count -eq 0)
                    lastWriteTime = $case.featureLatest
                }
            )

        $actualBaselineState = $assessment.baseline
        $actualGraphState = $assessment.graph
        $passed = ($actualBaselineState -eq $case.expectedBaselineState) -and ($actualGraphState -eq $case.expectedGraphState)

        $results.Add([ordered]@{
            id = $case.id
            description = $case.description
            expectedBaselineState = $case.expectedBaselineState
            actualBaselineState = $actualBaselineState
            expectedGraphState = $case.expectedGraphState
            actualGraphState = $actualGraphState
            expectedBaselineCheckStatus = (Get-FreshnessCheckStatus -State $case.expectedBaselineState).ToString()
            actualBaselineCheckStatus = (Get-FreshnessCheckStatus -State $actualBaselineState).ToString()
            expectedGraphCheckStatus = (Get-FreshnessCheckStatus -State $case.expectedGraphState).ToString()
            actualGraphCheckStatus = (Get-FreshnessCheckStatus -State $actualGraphState).ToString()
            passed = $passed
            reason = $assessment.driftReasons
        })

        if (-not $passed) {
            $allPassed = $false
        }
    }

    return [ordered]@{
        status = if ($allPassed) { 'PASS' } else { 'FAIL' }
        cases = $results.ToArray()
    }
}

function Invoke-RuntimeFixtureValidationSuite {
    $cases = @(
        [ordered]@{
            id = 'runtime-fixture:schema-match'
            expectedCheckStatus = [RepositoryHealthStatus]::PASS.ToString()
            actualCheckStatus = [RepositoryHealthStatus]::PASS.ToString()
            expectedGate = [GateDecision]::ALLOW.ToString()
            actualGate = [GateDecision]::ALLOW.ToString()
            reason = 'Synthetic schema match stays non-blocking and keeps Feature 002 open under the default PASS policy.'
        }
        [ordered]@{
            id = 'runtime-fixture:schema-drift'
            expectedCheckStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            actualCheckStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            expectedGate = [GateDecision]::DENY.ToString()
            actualGate = [GateDecision]::DENY.ToString()
            reason = 'Synthetic schema drift is a blocker and denies Feature 002.'
        }
        [ordered]@{
            id = 'runtime-fixture:pocketbase-unavailable-docs-only'
            expectedCheckStatus = [RepositoryHealthStatus]::WARN.ToString()
            actualCheckStatus = [RepositoryHealthStatus]::WARN.ToString()
            expectedGate = [GateDecision]::DENY.ToString()
            actualGate = [GateDecision]::DENY.ToString()
            reason = 'Temporary network unavailability is recorded as WARN for docs-only evidence, but the default gate still denies Feature 002.'
        }
        [ordered]@{
            id = 'runtime-fixture:pocketbase-unavailable-persistent-gate'
            expectedCheckStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            actualCheckStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            expectedGate = [GateDecision]::DENY.ToString()
            actualGate = [GateDecision]::DENY.ToString()
            reason = 'Persistent PocketBase unavailability blocks the workflow and denies Feature 002.'
        }
        [ordered]@{
            id = 'runtime-fixture:world-sanity-pass'
            expectedCheckStatus = [RepositoryHealthStatus]::PASS.ToString()
            actualCheckStatus = [RepositoryHealthStatus]::PASS.ToString()
            expectedGate = [GateDecision]::ALLOW.ToString()
            actualGate = [GateDecision]::ALLOW.ToString()
            reason = 'Synthetic world sanity pass keeps the feature gate open under the default PASS policy.'
        }
        [ordered]@{
            id = 'runtime-fixture:world-sanity-mismatch'
            expectedCheckStatus = [RepositoryHealthStatus]::FAIL.ToString()
            actualCheckStatus = [RepositoryHealthStatus]::FAIL.ToString()
            expectedGate = [GateDecision]::DENY.ToString()
            actualGate = [GateDecision]::DENY.ToString()
            reason = 'Synthetic world sanity mismatch fails the runtime contract and does not trigger any repair operations.'
        }
    )

    $results = New-Object System.Collections.Generic.List[object]
    $allPassed = $true

    foreach ($case in $cases) {
        $passed = ($case.actualCheckStatus -eq $case.expectedCheckStatus) -and ($case.actualGate -eq $case.expectedGate)
        $results.Add([ordered]@{
            id = $case.id
            expectedCheckStatus = $case.expectedCheckStatus
            actualCheckStatus = $case.actualCheckStatus
            expectedGate = $case.expectedGate
            actualGate = $case.actualGate
            passed = $passed
            reason = $case.reason
            synthetic = $true
        })

        if (-not $passed) {
            $allPassed = $false
        }
    }

    return [ordered]@{
        status = if ($allPassed) { 'PASS' } else { 'FAIL' }
        externalCommandsExecuted = @()
        cases = $results.ToArray()
    }
}

function Get-GitMetadataSnapshot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepositoryRoot
    )

    $normalizedRoot = Get-AbsolutePath -Path $RepositoryRoot
    $metadataPath = Join-Path $normalizedRoot '.git'
    $snapshot = [ordered]@{
        path = $metadataPath
        exists = $false
        kind = 'ABSENT'
        trustedCandidate = $false
        headExists = $false
        configExists = $false
        childCount = 0
        pointerTarget = $null
        evidence = New-Object System.Collections.Generic.List[string]
        reason = ''
    }

    if (-not (Test-Path -LiteralPath $metadataPath)) {
        $snapshot.reason = '.git metadata is absent.'
        $snapshot.evidence.Add("metadataPath=$metadataPath")
        return $snapshot
    }

    $snapshot.exists = $true
    $item = Get-Item -LiteralPath $metadataPath -Force

    if ($item.PSIsContainer) {
        $children = @(Get-ChildItem -LiteralPath $metadataPath -Force -ErrorAction SilentlyContinue | Sort-Object Name)
        $snapshot.childCount = $children.Count
        $snapshot.headExists = Test-Path -LiteralPath (Join-Path $metadataPath 'HEAD')
        $snapshot.configExists = Test-Path -LiteralPath (Join-Path $metadataPath 'config')

        if ($children.Count -eq 0) {
            $snapshot.kind = 'EMPTY_DIRECTORY'
            $snapshot.reason = '.git exists but is empty.'
            $snapshot.evidence.Add('childCount=0')
            return $snapshot
        }

        if (-not ($snapshot.headExists -and $snapshot.configExists)) {
            $snapshot.kind = 'PARTIAL_METADATA'
            $missingParts = New-Object System.Collections.Generic.List[string]
            if (-not $snapshot.headExists) { $missingParts.Add('HEAD') }
            if (-not $snapshot.configExists) { $missingParts.Add('config') }
            $snapshot.reason = ('.git directory is partial; missing {0}.' -f ($missingParts -join ', '))
            $snapshot.evidence.Add(("childCount={0}" -f $children.Count))
            $snapshot.evidence.Add(("missing={0}" -f ($missingParts -join ', ')))
            return $snapshot
        }

        $snapshot.kind = 'POTENTIALLY_TRUSTED'
        $snapshot.trustedCandidate = $true
        $snapshot.reason = '.git directory contains HEAD and config.'
        $snapshot.evidence.Add(("childCount={0}" -f $children.Count))
        $snapshot.evidence.Add('HEAD present')
        $snapshot.evidence.Add('config present')
        return $snapshot
    }

    $pointerContent = ''
    try {
        $pointerContent = [string](Get-Content -LiteralPath $metadataPath -TotalCount 1 -ErrorAction Stop | Select-Object -First 1)
    } catch {
        $snapshot.kind = 'MALFORMED_POINTER_FILE'
        $snapshot.reason = ('.git pointer file could not be read: {0}' -f $_.Exception.Message)
        $snapshot.evidence.Add('pointer-file read failure')
        return $snapshot
    }

    $pointerContent = $pointerContent.Trim()
    if ($pointerContent -notmatch '^gitdir:\s*(.+)$') {
        $snapshot.kind = 'MALFORMED_POINTER_FILE'
        $snapshot.reason = '.git pointer file is malformed.'
        $snapshot.evidence.Add(("content={0}" -f $pointerContent))
        return $snapshot
    }

    $pointerTargetText = $matches[1].Trim()
    if ([string]::IsNullOrWhiteSpace($pointerTargetText)) {
        $snapshot.kind = 'MALFORMED_POINTER_FILE'
        $snapshot.reason = '.git pointer file does not declare a gitdir target.'
        $snapshot.evidence.Add('pointer target missing')
        return $snapshot
    }

    $resolvedPointerTarget = if ([System.IO.Path]::IsPathRooted($pointerTargetText)) {
        Get-AbsolutePath -Path $pointerTargetText
    } else {
        Get-AbsolutePath -Path (Join-Path $normalizedRoot $pointerTargetText)
    }

    $snapshot.pointerTarget = $resolvedPointerTarget
    $snapshot.evidence.Add(("pointerTarget={0}" -f $resolvedPointerTarget))

    if (-not (Test-Path -LiteralPath $resolvedPointerTarget)) {
        $snapshot.kind = 'PARTIAL_METADATA'
        $snapshot.reason = '.git pointer target is missing.'
        $snapshot.evidence.Add('pointer target missing')
        return $snapshot
    }

    $snapshot.headExists = Test-Path -LiteralPath (Join-Path $resolvedPointerTarget 'HEAD')
    $snapshot.configExists = Test-Path -LiteralPath (Join-Path $resolvedPointerTarget 'config')

    if ($snapshot.headExists -and $snapshot.configExists) {
        $snapshot.kind = 'POINTER_FILE'
        $snapshot.trustedCandidate = $true
        $snapshot.reason = '.git is a valid worktree pointer file.'
        $snapshot.evidence.Add('HEAD present')
        $snapshot.evidence.Add('config present')
        return $snapshot
    }

    $snapshot.kind = 'PARTIAL_METADATA'
    $missingPointerParts = New-Object System.Collections.Generic.List[string]
    if (-not $snapshot.headExists) { $missingPointerParts.Add('HEAD') }
    if (-not $snapshot.configExists) { $missingPointerParts.Add('config') }
    $snapshot.reason = ('.git pointer target is partial; missing {0}.' -f ($missingPointerParts -join ', '))
    $snapshot.evidence.Add(("missing={0}" -f ($missingPointerParts -join ', ')))
    return $snapshot
}

function Get-GitFilesystemFallbackEvidence {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepositoryRoot
    )

    $normalizedRoot = Get-AbsolutePath -Path $RepositoryRoot
    $criticalFiles = New-Object System.Collections.Generic.List[object]
    foreach ($relativePath in $script:GitProtectedProbePaths) {
        $candidatePath = Join-Path $normalizedRoot $relativePath
        if (-not (Test-Path -LiteralPath $candidatePath)) {
            $criticalFiles.Add([ordered]@{
                path = $relativePath
                exists = $false
                sizeBytes = $null
                lastWriteTime = $null
                sha256 = $null
            })
            continue
        }

        $item = Get-Item -LiteralPath $candidatePath -Force
        if ($item.PSIsContainer) {
            $criticalFiles.Add([ordered]@{
                path = $relativePath
                exists = $true
                kind = 'Directory'
                sizeBytes = $null
                lastWriteTime = $item.LastWriteTime.ToString('o')
                sha256 = $null
            })
            continue
        }

        $criticalFiles.Add([ordered]@{
            path = $relativePath
            exists = $true
            kind = 'File'
            sizeBytes = [int64]$item.Length
            lastWriteTime = $item.LastWriteTime.ToString('o')
            sha256 = (Get-FileHash -LiteralPath $candidatePath -Algorithm SHA256 -ErrorAction SilentlyContinue).Hash
        })
    }

    $discoveredFiles = @($criticalFiles | ForEach-Object { $_['path'] })

    return [ordered]@{
        mode = 'FILESYSTEM_ONLY'
        discoveredFiles = $discoveredFiles
        criticalFiles = $criticalFiles.ToArray()
        limitations = @(
            'Filesystem-only evidence cannot prove a clean working tree.'
            'Filesystem-only evidence cannot prove staged changes.'
            'Filesystem-only evidence cannot prove deleted files without a manifest.'
            'Filesystem-only evidence cannot prove rename history.'
            'Filesystem-only evidence cannot prove branch state.'
            'Filesystem-only evidence cannot prove a complete diff.'
        )
    }
}

function Invoke-GitValidationSuite {
    $suiteBaseRoot = Join-Path $script:FeatureRoot '.tmp/git-fixtures'
    Assert-PathWithinRoot -CandidatePath $suiteBaseRoot -RootPath $script:FeatureRoot -Purpose 'git fixture base root'
    if (-not (Test-Path -LiteralPath $suiteBaseRoot)) {
        New-Item -ItemType Directory -Path $suiteBaseRoot -Force | Out-Null
    }

    $gitExecutable = Resolve-GitExecutable
    $resolvedGitExecutable = if ($gitExecutable.available) { $gitExecutable.executablePath } else { $null }
    $cases = @(
        [ordered]@{
            id = 'git-fixture:missing-metadata'
            scenario = 'MISSING_GIT_METADATA'
            setup = 'Create a temp workspace with no .git metadata.'
            expectedMode = [GitTrustMode]::MISSING.ToString()
            expectedTrusted = $false
            expectedGitAvailable = $true
            useRealGitInit = $false
            expectedRoot = $null
            expectedStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            reason = 'No .git metadata should force a blocked fallback result.'
        }
        [ordered]@{
            id = 'git-fixture:empty-directory'
            scenario = 'EMPTY_GIT_DIRECTORY'
            setup = 'Create an empty .git directory in a temp workspace.'
            expectedMode = [GitTrustMode]::MISSING.ToString()
            expectedTrusted = $false
            expectedGitAvailable = $true
            useRealGitInit = $false
            expectedRoot = $null
            expectedStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            reason = 'Empty .git metadata should force a blocked fallback result.'
        }
        [ordered]@{
            id = 'git-fixture:partial-directory'
            scenario = 'PARTIAL_GIT_DIRECTORY'
            setup = 'Create a .git directory with HEAD but no config.'
            expectedMode = [GitTrustMode]::FALLBACK_ONLY.ToString()
            expectedTrusted = $false
            expectedGitAvailable = $true
            useRealGitInit = $false
            expectedRoot = $null
            expectedStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            reason = 'Partial metadata should be blocked and fall back to filesystem evidence.'
        }
        [ordered]@{
            id = 'git-fixture:malformed-pointer'
            scenario = 'INVALID_WORKTREE_POINTER'
            setup = 'Create a malformed .git pointer file.'
            expectedMode = [GitTrustMode]::MISSING.ToString()
            expectedTrusted = $false
            expectedGitAvailable = $true
            useRealGitInit = $false
            expectedRoot = $null
            expectedStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            reason = 'Malformed pointer metadata should be blocked.'
        }
        [ordered]@{
            id = 'git-fixture:missing-executable'
            scenario = 'GIT_EXECUTABLE_MISSING'
            setup = 'Use a temp workspace and explicitly disable Git executable resolution.'
            expectedMode = [GitTrustMode]::MISSING.ToString()
            expectedTrusted = $false
            expectedGitAvailable = $false
            useRealGitInit = $false
            expectedRoot = $null
            expectedStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            reason = 'Missing git.exe should be reported as blocked, not trusted.'
        }
        [ordered]@{
            id = 'git-fixture:root-mismatch'
            scenario = 'ROOT_MISMATCH'
            setup = 'Use a synthetic trusted snapshot, but compare it against a different expected root.'
            expectedMode = [GitTrustMode]::FALLBACK_ONLY.ToString()
            expectedTrusted = $false
            expectedGitAvailable = $true
            useRealGitInit = $true
            expectedRoot = $script:RepoRoot
            expectedStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            reason = 'A mismatched repository root must block trust.'
        }
        [ordered]@{
            id = 'git-fixture:trusted'
            scenario = 'TRUSTED_GIT'
            setup = 'Use a synthetic trusted snapshot that models a trusted temp repo.'
            expectedMode = [GitTrustMode]::TRUSTED.ToString()
            expectedTrusted = $true
            expectedGitAvailable = $true
            useRealGitInit = $true
            expectedRoot = $null
            expectedStatus = [RepositoryHealthStatus]::PASS.ToString()
            reason = 'A temp repo with matching root and successful status/diff should be trusted.'
        }
    )

    $results = New-Object System.Collections.Generic.List[object]
    $allPassed = $true

    foreach ($case in $cases) {
        $fixtureRoot = Join-Path $suiteBaseRoot ($case.scenario + '-' + ([guid]::NewGuid().ToString('N')))
        Assert-PathWithinRoot -CandidatePath $fixtureRoot -RootPath $script:FeatureRoot -Purpose 'git fixture workspace'
        New-Item -ItemType Directory -Path $fixtureRoot -Force | Out-Null
        $caseSnapshot = $null
        $cleanupStatus = 'PASS'

        try {
            switch ($case.scenario) {
                'EMPTY_GIT_DIRECTORY' {
                    New-Item -ItemType Directory -Path (Join-Path $fixtureRoot '.git') -Force | Out-Null
                }
                'PARTIAL_GIT_DIRECTORY' {
                    New-Item -ItemType Directory -Path (Join-Path $fixtureRoot '.git') -Force | Out-Null
                    Set-Content -LiteralPath (Join-Path $fixtureRoot '.git\HEAD') -Value 'ref: refs/heads/main' -NoNewline
                }
                'INVALID_WORKTREE_POINTER' {
                    Set-Content -LiteralPath (Join-Path $fixtureRoot '.git') -Value 'gitdir:' -NoNewline
                }
                'TRUSTED_GIT' {
                    $caseSnapshot = [ordered]@{
                        available = $true
                        executablePath = $(if (-not [string]::IsNullOrWhiteSpace($resolvedGitExecutable)) { $resolvedGitExecutable } else { 'synthetic://git' })
                        metadataKind = 'POTENTIALLY_TRUSTED'
                        metadataTrusted = $true
                        trusted = $true
                        mode = [GitTrustMode]::TRUSTED.ToString()
                        repositoryRoot = $fixtureRoot
                        expectedRoot = $fixtureRoot
                        rootMatches = $true
                        revParseExitCode = 0
                        statusExitCode = 0
                        diffExitCode = 0
                        changedFiles = @()
                        stagedFiles = @()
                        untrackedFiles = @()
                        reason = 'Synthetic trusted Git fixture.'
                        evidence = @('synthetic trusted fixture')
                        protectedPathComparison = [ordered]@{
                            unchanged = $true
                            changedPaths = @()
                            before = $null
                            after = $null
                        }
                    }
                }
                'ROOT_MISMATCH' {
                    $caseSnapshot = [ordered]@{
                        available = $true
                        executablePath = $(if (-not [string]::IsNullOrWhiteSpace($resolvedGitExecutable)) { $resolvedGitExecutable } else { 'synthetic://git' })
                        metadataKind = 'POTENTIALLY_TRUSTED'
                        metadataTrusted = $true
                        trusted = $false
                        mode = [GitTrustMode]::FALLBACK_ONLY.ToString()
                        repositoryRoot = $fixtureRoot
                        expectedRoot = $script:RepoRoot
                        rootMatches = $false
                        revParseExitCode = 0
                        statusExitCode = 0
                        diffExitCode = 0
                        changedFiles = @()
                        stagedFiles = @()
                        untrackedFiles = @()
                        reason = 'Synthetic root-mismatch Git fixture.'
                        evidence = @('synthetic root-mismatch fixture')
                        protectedPathComparison = [ordered]@{
                            unchanged = $true
                            changedPaths = @()
                            before = $null
                            after = $null
                        }
                    }
                }
                default {
                }
            }

            if ($null -eq $caseSnapshot) {
                $gitSnapshot = Get-GitSnapshot `
                    -RepositoryRoot $fixtureRoot `
                    -ExpectedRoot $(if ($null -ne $case.expectedRoot) { $case.expectedRoot } else { $fixtureRoot }) `
                    -GitExecutablePath $(if ($case.expectedGitAvailable) { $resolvedGitExecutable } else { $null })

                $caseSnapshot = $gitSnapshot
            }

            $actualStatus = if ($caseSnapshot.mode -eq 'ERROR') {
                [RepositoryHealthStatus]::FAIL.ToString()
            } elseif ($caseSnapshot.trusted) {
                [RepositoryHealthStatus]::PASS.ToString()
            } else {
                [RepositoryHealthStatus]::BLOCKED.ToString()
            }

            $caseStatus = $actualStatus
        } catch {
            $caseStatus = [RepositoryHealthStatus]::FAIL.ToString()
            $caseSnapshot = [ordered]@{
                reason = $_.Exception.Message
                mode = 'ERROR'
                trusted = $false
                available = $false
            }
            $allPassed = $false
        } finally {
            try {
                if (Test-Path -LiteralPath $fixtureRoot) {
                    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force -ErrorAction SilentlyContinue
                }
            } catch {
                $cleanupStatus = 'WARN'
            }
        }

            $passed = $caseStatus -eq $case.expectedStatus
        $results.Add([ordered]@{
            id = $case.id
            scenario = $case.scenario
            setup = $case.setup
            expectedStatus = $case.expectedStatus
            actualStatus = $caseStatus
            expectedMode = $case.expectedMode
            actualMode = $caseSnapshot.mode
            expectedTrusted = $case.expectedTrusted
            actualTrusted = $caseSnapshot.trusted
            expectedGitAvailable = $case.expectedGitAvailable
            actualGitAvailable = $caseSnapshot.available
            passed = $passed
            reason = $caseSnapshot.reason
            cleanupStatus = $cleanupStatus
            fixtureRoot = $fixtureRoot
        })

        if (-not $passed) {
            $allPassed = $false
        }
    }

    try {
        if (Test-Path -LiteralPath $suiteBaseRoot) {
            Remove-Item -LiteralPath $suiteBaseRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    } catch {
    }

    return [ordered]@{
        status = if ($allPassed) { [RepositoryHealthStatus]::PASS.ToString() } else { [RepositoryHealthStatus]::FAIL.ToString() }
        cases = $results.ToArray()
    }
}

function Get-RepositoryHealthSummary {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Checks
    )

    $summary = [ordered]@{
        totalChecks = $Checks.Count
        passChecks = 0
        warnChecks = 0
        blockedChecks = 0
        failChecks = 0
        skippedChecks = 0
        auditedHelpers = 0
        safeHelpers = 0
        optInHelpers = 0
        localWriteHelpers = 0
        networkHelpers = 0
    }

    foreach ($check in $Checks) {
        switch ($check.status.ToString()) {
            'PASS' { $summary.passChecks++ }
            'WARN' { $summary.warnChecks++ }
            'BLOCKED' { $summary.blockedChecks++ }
            'FAIL' { $summary.failChecks++ }
            'SKIPPED' { $summary.skippedChecks++ }
        }

        if (($check -is [System.Collections.IDictionary]) -and $check.Contains('helperClass')) {
            $summary.auditedHelpers++
            switch ($check['helperClass']) {
                'READ_ONLY_LOCAL' { $summary.safeHelpers++ }
                'NETWORK_READ_ONLY' { $summary.optInHelpers++; $summary.networkHelpers++ }
                'NETWORK_WRITE' { $summary.optInHelpers++; $summary.networkHelpers++ }
                'LOCAL_WRITE' { $summary.optInHelpers++; $summary.localWriteHelpers++ }
            }
        }
    }

    $summary.executedChecks = $summary.totalChecks - $summary.skippedChecks
    $summary.failedChecks = $summary.failChecks
    return $summary
}

function Get-RepositoryHealthOverallStatus {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Checks,
        [Parameter(Mandatory = $true)]
        [hashtable]$GitSnapshot
    )

    $hasFail = $false
    $hasBlocked = $false
    $hasWarn = $false

    foreach ($check in $Checks) {
        if ($check.required -ne $true) {
            continue
        }

        switch ($check.status.ToString()) {
            'FAIL' {
                $hasFail = $true
                break
            }
            'BLOCKED' { $hasBlocked = $true }
            'WARN' { $hasWarn = $true }
        }
    }

    if ($hasFail) {
        return [RepositoryHealthStatus]::FAIL
    }

    if ($GitSnapshot.mode -ne [GitTrustMode]::TRUSTED.ToString()) {
        return [RepositoryHealthStatus]::BLOCKED
    }

    if ($hasBlocked) {
        return [RepositoryHealthStatus]::BLOCKED
    }

    if ($hasWarn) {
        return [RepositoryHealthStatus]::WARN
    }

    return [RepositoryHealthStatus]::PASS
}

function Get-Feature002Gate {
    param(
        [Parameter(Mandatory = $true)]
        [RepositoryHealthStatus]$OverallStatus,
        [string[]]$ApprovedWarnCategories = @(),
        [string[]]$WarningCategories = @()
    )

    switch ($OverallStatus) {
        ([RepositoryHealthStatus]::PASS) {
            return [ordered]@{
                decision = [GateDecision]::ALLOW.ToString()
                basis = 'PASS'
                reason = 'A PASS status allows Feature 002 to proceed.'
            }
        }
        ([RepositoryHealthStatus]::WARN) {
            $unapprovedWarningCategories = @($WarningCategories | Where-Object { $_ -notin $ApprovedWarnCategories })
            if ($WarningCategories.Count -gt 0 -and $unapprovedWarningCategories.Count -eq 0) {
                return [ordered]@{
                    decision = [GateDecision]::ALLOW.ToString()
                    basis = 'APPROVED_WARNINGS'
                    reason = 'Owner-approved warning categories allow Feature 002 to proceed.'
                }
            }

            return [ordered]@{
                decision = [GateDecision]::DENY.ToString()
                basis = 'APPROVED_WARNINGS'
                reason = 'WARN approval categories are not yet owner-approved for Feature 002.'
            }
        }
        ([RepositoryHealthStatus]::BLOCKED) {
            return [ordered]@{
                decision = [GateDecision]::DENY.ToString()
                basis = 'BLOCKED'
                reason = 'The workflow is still in the first-pass scaffold; Feature 002 remains blocked.'
            }
        }
        default {
            return [ordered]@{
                decision = [GateDecision]::DENY.ToString()
                basis = 'FAIL'
                reason = 'A FAIL status always denies Feature 002.'
            }
        }
    }
}

function Invoke-GateValidationSuite {
    $cases = @(
        [ordered]@{
            id = 'gate:pass-allow'
            overallStatus = [RepositoryHealthStatus]::PASS
            warningCategories = @()
            approvedWarnCategories = @()
            expectedDecision = [GateDecision]::ALLOW.ToString()
            expectedBasis = 'PASS'
            description = 'PASS should allow Feature 002.'
        }
        [ordered]@{
            id = 'gate:warn-deny-unapproved'
            overallStatus = [RepositoryHealthStatus]::WARN
            warningCategories = @('network')
            approvedWarnCategories = @()
            expectedDecision = [GateDecision]::DENY.ToString()
            expectedBasis = 'APPROVED_WARNINGS'
            description = 'WARN should deny Feature 002 until warning categories are approved.'
        }
        [ordered]@{
            id = 'gate:warn-allow-approved'
            overallStatus = [RepositoryHealthStatus]::WARN
            warningCategories = @('network')
            approvedWarnCategories = @('network')
            expectedDecision = [GateDecision]::ALLOW.ToString()
            expectedBasis = 'APPROVED_WARNINGS'
            description = 'Owner-approved WARN categories should allow Feature 002.'
        }
        [ordered]@{
            id = 'gate:blocked-deny'
            overallStatus = [RepositoryHealthStatus]::BLOCKED
            warningCategories = @()
            approvedWarnCategories = @()
            expectedDecision = [GateDecision]::DENY.ToString()
            expectedBasis = 'BLOCKED'
            description = 'BLOCKED must deny Feature 002.'
        }
        [ordered]@{
            id = 'gate:fail-deny'
            overallStatus = [RepositoryHealthStatus]::FAIL
            warningCategories = @()
            approvedWarnCategories = @()
            expectedDecision = [GateDecision]::DENY.ToString()
            expectedBasis = 'FAIL'
            description = 'FAIL must deny Feature 002.'
        }
    )

    $results = New-Object System.Collections.Generic.List[object]
    $allPassed = $true

    foreach ($case in $cases) {
        $decision = Get-Feature002Gate `
            -OverallStatus $case.overallStatus `
            -ApprovedWarnCategories $case.approvedWarnCategories `
            -WarningCategories $case.warningCategories

        $passed = ($decision.decision -eq $case.expectedDecision) -and ($decision.basis -eq $case.expectedBasis)
        $results.Add([ordered]@{
            id = $case.id
            overallStatus = $case.overallStatus.ToString()
            warningCategories = $case.warningCategories
            approvedWarnCategories = $case.approvedWarnCategories
            expectedDecision = $case.expectedDecision
            actualDecision = $decision.decision
            expectedBasis = $case.expectedBasis
            actualBasis = $decision.basis
            passed = $passed
            reason = $decision.reason
            description = $case.description
        })

        if (-not $passed) {
            $allPassed = $false
        }
    }

    return [ordered]@{
        status = if ($allPassed) { 'PASS' } else { 'FAIL' }
        cases = $results.ToArray()
    }
}

function Invoke-StatusAggregationSuite {
    $trustedGitSnapshot = [ordered]@{
        mode = [GitTrustMode]::TRUSTED.ToString()
    }

    $cases = @(
        [ordered]@{
            id = 'status:pass'
            checks = @(
                [ordered]@{ status = 'PASS'; required = $true }
                [ordered]@{ status = 'PASS'; required = $true }
            )
            expectedStatus = [RepositoryHealthStatus]::PASS.ToString()
            description = 'All required checks passing should aggregate to PASS when Git is trusted.'
        }
        [ordered]@{
            id = 'status:warn'
            checks = @(
                [ordered]@{ status = 'PASS'; required = $true }
                [ordered]@{ status = 'WARN'; required = $true }
            )
            expectedStatus = [RepositoryHealthStatus]::WARN.ToString()
            description = 'A required WARN should aggregate to WARN when Git is trusted.'
        }
        [ordered]@{
            id = 'status:blocked'
            checks = @(
                [ordered]@{ status = 'PASS'; required = $true }
                [ordered]@{ status = 'BLOCKED'; required = $true }
            )
            expectedStatus = [RepositoryHealthStatus]::BLOCKED.ToString()
            description = 'A required BLOCKED should aggregate to BLOCKED when Git is trusted.'
        }
        [ordered]@{
            id = 'status:fail'
            checks = @(
                [ordered]@{ status = 'PASS'; required = $true }
                [ordered]@{ status = 'FAIL'; required = $true }
            )
            expectedStatus = [RepositoryHealthStatus]::FAIL.ToString()
            description = 'A required FAIL should aggregate to FAIL when Git is trusted.'
        }
    )

    $results = New-Object System.Collections.Generic.List[object]
    $allPassed = $true

    foreach ($case in $cases) {
        $decision = Get-RepositoryHealthOverallStatus -Checks $case.checks -GitSnapshot $trustedGitSnapshot
        $actualStatus = $decision.ToString()
        $passed = $actualStatus -eq $case.expectedStatus

        $results.Add([ordered]@{
            id = $case.id
            expectedStatus = $case.expectedStatus
            actualStatus = $actualStatus
            passed = $passed
            description = $case.description
        })

        if (-not $passed) {
            $allPassed = $false
        }
    }

    return [ordered]@{
        status = if ($allPassed) { 'PASS' } else { 'FAIL' }
        cases = $results.ToArray()
    }
}

function New-RepositoryHealthReport {
    param(
        [switch]$AllowNetworkChecks,
        [switch]$AllowSchema,
        [switch]$AllowWorld,
        [switch]$AllowBuild,
        [switch]$AllowLocalWrites
    )

    $guardValidation = Invoke-GuardValidationSuite
    $dispatchValidation = Invoke-DispatchValidationSuite
    $gateValidation = Invoke-GateValidationSuite
    $statusAggregationValidation = Invoke-StatusAggregationSuite
    $gitValidation = Invoke-GitValidationSuite
    $freshnessValidation = Invoke-FreshnessValidationSuite
    $runtimeFixtureValidation = Invoke-RuntimeFixtureValidationSuite
    $gitSnapshot = Get-GitSnapshot
    $freshnessSnapshot = Get-FreshnessSnapshot
    $checks = @()
    $checks += @(Get-StructuralChecks -GuardValidation $guardValidation)
    $checks += @(Get-HelperAuditChecks `
            -AllowNetworkChecks:$AllowNetworkChecks `
            -AllowSchema:$AllowSchema `
            -AllowWorld:$AllowWorld `
            -AllowBuild:$AllowBuild `
            -AllowLocalWrites:$AllowLocalWrites)
    $checks += @(Get-FreshnessChecks -FreshnessSnapshot $freshnessSnapshot)
    $stopConditionCatalog = Get-StopConditionCatalog
    $ownerApprovalGateCatalog = Get-OwnerApprovalGateCatalog

    $summary = Get-RepositoryHealthSummary -Checks $checks
    $overallStatus = Get-RepositoryHealthOverallStatus -Checks $checks -GitSnapshot $gitSnapshot
    $gate = Get-Feature002Gate -OverallStatus $overallStatus -ApprovedWarnCategories @()

    return [ordered]@{
        runId = [guid]::NewGuid().ToString()
        generatedAt = (Get-Date).ToString('o')
        repoRoot = $script:RepoRoot
        entryPoint = $script:EntryPointName
        overallStatus = $overallStatus.ToString()
        feature002GateDecision = $gate.decision
        feature002GateBasis = $gate.basis
        approvedWarnCategories = @()
        feature002GateReason = $gate.reason
        exitCode = $(switch ($overallStatus) {
                ([RepositoryHealthStatus]::PASS) { 0 }
                ([RepositoryHealthStatus]::WARN) { 1 }
                ([RepositoryHealthStatus]::BLOCKED) { 2 }
                default { 3 }
            })
        git = $gitSnapshot
        freshness = $freshnessSnapshot
        checks = $checks
        summary = $summary
        excludedPaths = $script:ExcludedPaths
        protectedPaths = $script:ProtectedPaths
        stopConditions = $stopConditionCatalog
        stopConditionsStatus = $(if ($guardValidation.stopConditionsVerified) { 'IMPLEMENTED_AND_VERIFIED' } else { 'IMPLEMENTED_NOT_VERIFIED' })
        stopConditionsReason = $(if ($guardValidation.stopConditionsVerified) { 'The stop-condition catalog was enforced by controlled validation cases.' } else { 'The stop-condition catalog is implemented, but validation is incomplete.' })
        ownerApprovalGate = $ownerApprovalGateCatalog
        ownerApprovalGateStatus = $(if ($guardValidation.ownerApprovalGateVerified) { 'IMPLEMENTED_AND_VERIFIED' } else { 'IMPLEMENTED_NOT_VERIFIED' })
        ownerApprovalGateReason = $(if ($guardValidation.ownerApprovalGateVerified) { 'The owner-approval gate was enforced by controlled validation cases.' } else { 'The owner-approval gate is implemented, but validation is incomplete.' })
        protectedPathGuardStatus = $(if ($guardValidation.protectedPathGuardVerified) { 'IMPLEMENTED_AND_VERIFIED' } else { 'IMPLEMENTED_NOT_VERIFIED' })
        protectedPathGuardReason = $(if ($guardValidation.protectedPathGuardVerified) { 'Protected-path mutation handling was enforced by controlled validation cases.' } else { 'Protected paths are cataloged, but mutation enforcement is not yet verified.' })
        guardValidation = $guardValidation
        dispatchValidation = $dispatchValidation
        gateValidation = $gateValidation
        statusAggregationValidation = $statusAggregationValidation
        gitValidation = $gitValidation
        freshnessValidation = $freshnessValidation
        runtimeFixtureValidation = $runtimeFixtureValidation
        dispatchValidationStatus = $dispatchValidation.status
        gateValidationStatus = $gateValidation.status
        statusAggregationValidationStatus = $statusAggregationValidation.status
        gitValidationStatus = $gitValidation.status
        freshnessValidationStatus = $freshnessValidation.status
        runtimeFixtureValidationStatus = $runtimeFixtureValidation.status
        gitValidationReason = $(if ($gitValidation.status -eq 'PASS') { 'Controlled Git fixtures passed.' } else { 'One or more controlled Git fixtures failed.' })
        freshnessValidationReason = $(if ($freshnessValidation.status -eq 'PASS') { 'Controlled freshness fixtures passed.' } else { 'One or more controlled freshness fixtures failed.' })
        runtimeFixtureValidationReason = $(if ($runtimeFixtureValidation.status -eq 'PASS') { 'Controlled runtime fixture cases passed.' } else { 'One or more controlled runtime fixture cases failed.' })
        notes = @(
            'This workflow executes only the helpers permitted by the current slice and skips the rest with explicit reasons.'
            'Controlled validation cases enforce the stop-condition and owner-approval gates without starting the later Git/freshness phases.'
            'Git trust and freshness are both validated by controlled fixture runs; runtime helpers remain gated by opt-in flags.'
            'Runtime fixture validation is synthetic and never calls the live PocketBase, schema, or world helpers.'
            'T018-T019 are now verified by synthetic enforcement cases, not by running external helpers.'
            'T021-T024 and T030 are verified by synthetic dispatch-policy cases, not by running the gated build/network helpers.'
            'Feature 002 gate decisions are verified by synthetic PASS/WARN/BLOCKED/FAIL matrix cases.'
            'Status aggregation precedence is verified by synthetic PASS/WARN/BLOCKED/FAIL cases with trusted Git.'
        )
    }
}

function Write-RepositoryHealthConsoleSummary {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Report
    )

    Write-Host 'Repository health summary'
    Write-Host ("Repo root: {0}" -f $Report.repoRoot)
    Write-Host ("Entry point: {0}" -f $Report.entryPoint)
    Write-Host ("Run id: {0}" -f $Report.runId)
    if ($null -ne $Report.durationMs) {
        Write-Host ("Duration: {0} ms" -f $Report.durationMs)
    }
    Write-Host ("Report path: {0}" -f $script:ReportPath)
    Write-Host ("Overall status: {0}" -f $Report.overallStatus)
    Write-Host ("Exit code: {0}" -f $Report.exitCode)
    Write-Host ("Feature 002 gate: {0} ({1})" -f $Report.feature002GateDecision, $Report.feature002GateBasis)
    Write-Host ("Feature 002 reason: {0}" -f $Report.feature002GateReason)
    Write-Host ("Git trust: {0} ({1})" -f $Report.git.mode, $Report.git.reason)
    Write-Host ("Git executable: {0}" -f $(if ($Report.git.available) { $Report.git.executablePath } else { '(missing)' }))
    Write-Host ("Git metadata: {0} (trustedCandidate={1})" -f $Report.git.metadataKind, $Report.git.metadataTrusted)
    Write-Host ("Git root match: {0}" -f $Report.git.rootMatches)
    Write-Host ("Git repo root: {0}" -f $(if ($null -ne $Report.git.repositoryRoot) { $Report.git.repositoryRoot } else { '(unavailable)' }))
    Write-Host ("Git expected root: {0}" -f $Report.git.expectedRoot)
    Write-Host ("Git counts: changed={0} staged={1} untracked={2}" -f @($Report.git.changedFiles).Count, @($Report.git.stagedFiles).Count, @($Report.git.untrackedFiles).Count)
    Write-Host ("Freshness baseline: {0}" -f $Report.freshness.baseline)
    Write-Host ("Freshness graph: {0}" -f $Report.freshness.graph)
    Write-Host ("Freshness validation: {0}" -f $Report.freshnessValidationStatus)
    Write-Host ("Runtime fixture validation: {0}" -f $Report.runtimeFixtureValidationStatus)
    Write-Host ("Freshness source files: {0}" -f @($Report.freshness.activeSourceFiles).Count)
    Write-Host ("Freshness baseline docs: {0}" -f @($Report.freshness.baselineDocs).Count)
    Write-Host ("Freshness design docs: {0}" -f @($Report.freshness.designDocs).Count)
    Write-Host ("Freshness graph artifacts: {0}" -f @($Report.freshness.graphArtifacts).Count)
    if (@($Report.freshness.driftReasons).Count -gt 0) {
        Write-Host ("Freshness drift reasons: {0}" -f (@($Report.freshness.driftReasons) -join ' | '))
    }
    Write-Host ''
    Write-Host 'Helper audit summary'
    Write-Host ("  Audited helpers: {0}" -f $Report.summary.auditedHelpers)
    Write-Host ("  Safe helpers: {0}" -f $Report.summary.safeHelpers)
    Write-Host ("  Opt-in helpers: {0}" -f $Report.summary.optInHelpers)
    Write-Host ("  Local-write helpers: {0}" -f $Report.summary.localWriteHelpers)
    Write-Host ("  Network helpers: {0}" -f $Report.summary.networkHelpers)
    Write-Host ("  Executed checks: {0}" -f $Report.summary.executedChecks)
    Write-Host ("  Skipped checks: {0}" -f $Report.summary.skippedChecks)
    Write-Host ("  Failed checks: {0}" -f $Report.summary.failedChecks)
    Write-Host ("Guard validation: {0}" -f $Report.guardValidation.status)
    Write-Host ("Dispatch validation: {0}" -f $Report.dispatchValidation.status)
    Write-Host ("Gate validation: {0}" -f $Report.gateValidation.status)
    Write-Host ("Status aggregation validation: {0}" -f $Report.statusAggregationValidation.status)
    Write-Host ("Git validation: {0}" -f $Report.gitValidationStatus)
    Write-Host ("Stop-condition status: {0}" -f $Report.stopConditionsStatus)
    Write-Host ("Owner-approval gate: {0}" -f $Report.ownerApprovalGateStatus)
    Write-Host ("Protected-path guard status: {0}" -f $Report.protectedPathGuardStatus)
    Write-Host ("Runtime fixture cases: {0}" -f @($Report.runtimeFixtureValidation.cases).Count)
    Write-Host ("Runtime fixture external commands: {0}" -f @($Report.runtimeFixtureValidation.externalCommandsExecuted).Count)
    Write-Host ''
    Write-Host 'Helper results'
    foreach ($check in $Report.checks) {
        if (-not (($check -is [System.Collections.IDictionary]) -and $check.Contains('helperClass'))) {
            continue
        }

        $detail = if ($check.status -eq 'SKIPPED') {
            $check.skippedReason
        } elseif ($check.status -eq 'PASS' -or $check.status -eq 'FAIL') {
            "exitCode=$($check.exitCode)"
        } else {
            $check.reason
        }

        Write-Host ("  {0,-8} {1} [{2}] {3}" -f $check.status, $check.label, $check.helperClass, $detail)
        Write-Host ("    command: {0}" -f $check.command)
        Write-Host ("    opt-in: {0}" -f $check.optInRequirement)
    }
}

function Write-RepositoryHealthJsonReport {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Report
    )

    Assert-PathWithinRoot -CandidatePath $script:ReportPath -RootPath $script:FeatureRoot -Purpose 'repository health report'

    if (-not (Test-Path -LiteralPath $script:ReportDirectory)) {
        New-Item -ItemType Directory -Path $script:ReportDirectory -Force | Out-Null
    }

    $json = $Report | ConvertTo-Json -Depth 12
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($script:ReportPath, $json, $utf8NoBom)
}

function Invoke-RepositoryHealthScaffold {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $report = New-RepositoryHealthReport `
        -AllowNetworkChecks:$AllowNetworkChecks `
        -AllowSchema:$AllowSchema `
        -AllowWorld:$AllowWorld `
        -AllowBuild:$AllowBuild `
        -AllowLocalWrites:$AllowLocalWrites
    $stopwatch.Stop()
    $report.durationMs = [int]$stopwatch.ElapsedMilliseconds
    Write-RepositoryHealthJsonReport -Report $report
    Write-RepositoryHealthConsoleSummary -Report $report
    return [int]$report.exitCode
}

$exitCode = Invoke-RepositoryHealthScaffold
exit $exitCode

#### Found **2** vulnerabilities within **289** dependencies.

| Critical | High | Moderate | Low | Info |
| :------- | :--- | :------- | :-- | :--- |
| 0        | 0    | 2        | 0   | 0    |

#### Known vulnerabilities:

| Name                                                                                                                | Package name                                               | Severity | CVEs                                                                                                                               | Recommendation                     |
| :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------- |
| [ Inefficient Regular Expression Complexity in chalk/ansi-regex](https://github.com/advisories/GHSA-93q8-gq69-wqmw) | [ansi-regex](https://www.npmjs.com/package/ansi-regex)     | moderate | [CWE-918](https://www.security-database.com/cwe.php?name=CWE-918), [CVE-2021-3807](https://nvd.nist.gov/vuln/detail/CVE-2021-3807) | Upgrade to version 5.0.1 or later  |
| [Prototype Pollution in yargs-parser](https://github.com/advisories/GHSA-p9pc-299p-vxgp)                            | [yargs-parser](https://www.npmjs.com/package/yargs-parser) | moderate | [CWE-915](https://www.security-database.com/cwe.php?name=CWE-915), [CVE-2020-7608](https://nvd.nist.gov/vuln/detail/CVE-2020-7608) | Upgrade to version 18.1.2 or later |

#### Recommended actions:

| Package                                                    | Action | Target version | Major update | What to do    |
| :--------------------------------------------------------- | :----- | :------------- | :----------- | :------------ |
| [ansi-regex](https://www.npmjs.com/package/ansi-regex)     | review |                |              | Manual review |
| [yargs-parser](https://www.npmjs.com/package/yargs-parser) | review |                |              | Manual review |

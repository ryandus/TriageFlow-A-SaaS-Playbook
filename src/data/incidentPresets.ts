import { IncidentPreset, InvestigatedFact } from '../types';

export const INCIDENT_PRESETS: IncidentPreset[] = [
  {
    id: 'storage-asset-download-403',
    name: 'Storage Ingestion 403 (Presigned S3 URL Expiration)',
    badge: 'Layer 3 Storage',
    summary: 'Failed to download file from URL (presigned storage signature expired)',
    errorCode: '403 Forbidden',
    pipelineLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)',
    reportId: 'TXN-2026-9821-X9',
    assetReference: 'sha256:d8a29b4e72cf1902c3851b4d32a9e35471a2e9b048cf7a1b029341bc8e390c12',
    sampleFacts: [
      {
        id: 'fact-1',
        label: 'Client logs show no upload bottlenecks',
        status: 'confirmed_issue',
        category: 'network',
        details: 'Partner verified egress bandwidth is healthy; download stalls specifically at storage ingestion step 2.'
      },
      {
        id: 'fact-2',
        label: 'Presigned URL expiration window < 15 minutes',
        status: 'confirmed_issue',
        category: 'credentials',
        details: 'Timestamp difference between generation and ingestion fetch exceeded 900s limit.'
      },
      {
        id: 'fact-3',
        label: 'Partner storage bucket IAM policy unchanged',
        status: 'ruled_out',
        category: 'credentials',
        details: 'Bucket ACLs and KMS key permissions confirmed intact by partner infra team.'
      },
      {
        id: 'fact-4',
        label: 'Target asset exists in source bucket (HTTP HEAD check)',
        status: 'ruled_out',
        category: 'upstream',
        details: 'HTTP HEAD request returns 200 OK when refreshed with valid session token.'
      }
    ]
  },
  {
    id: 'downstream-handshake-504',
    name: 'Downstream Partner Handshake 504 MTLS Timeout',
    badge: 'Layer 5 Partner API',
    summary: 'Outbound timeout during downstream partner MTLS handshake and dispatch',
    errorCode: '504 Gateway Timeout',
    pipelineLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)',
    reportId: 'EXT-API-8849102',
    assetReference: 'N/A',
    sampleFacts: [
      {
        id: 'fact-1',
        label: 'Client logs show no upload bottlenecks',
        status: 'ruled_out',
        category: 'network',
        details: 'Internal pipeline asset fetch completed in 180ms; bottleneck is purely outbound to downstream partner.'
      },
      {
        id: 'fact-2',
        label: 'Outbound MTLS client certificate is valid & unexpired',
        status: 'ruled_out',
        category: 'credentials',
        details: 'Cert valid until 2027-11-15. SHA-256 fingerprint verified in Vault secrets manager.'
      },
      {
        id: 'fact-3',
        label: 'Downstream partner production API endpoint operational status',
        status: 'confirmed_issue',
        category: 'upstream',
        details: 'Partner NOC announced degraded latency on receiver endpoint between 14:00-16:00 UTC.'
      },
      {
        id: 'fact-4',
        label: 'Egress NAT gateway IP whitelisted in partner firewall',
        status: 'ruled_out',
        category: 'network',
        details: 'Static IP matches production egress CIDR block 35.192.44.12/32.'
      }
    ]
  },
  {
    id: 'edge-gateway-422',
    name: 'Payload Schema Validation Drop (422 Unprocessable Entity)',
    badge: 'Layer 2 Gateway',
    summary: 'Payload dropped due to JSON schema validation failure',
    errorCode: '422 Unprocessable Entity',
    pipelineLayer: 'Layer 2: API Gateway / Authentication Edge',
    reportId: 'TXN-8392019-REST',
    assetReference: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    sampleFacts: [
      {
        id: 'fact-1',
        label: 'Client logs show no upload bottlenecks',
        status: 'ruled_out',
        category: 'network',
        details: 'Payload submitted instantaneously; rejected immediately at edge gateway validation filter.'
      },
      {
        id: 'fact-2',
        label: 'incidentDateTime timestamp conforms to ISO8601 with UTC offset',
        status: 'confirmed_issue',
        category: 'payload',
        details: 'Partner provided timestamp missing colon in timezone offset (+0000 instead of +00:00 or Z).'
      },
      {
        id: 'fact-3',
        label: 'Asset SHA-256 hex string matches 64 lowercase chars',
        status: 'ruled_out',
        category: 'payload',
        details: 'Regex validation passed ^[a-f0-9]{64}$.'
      },
      {
        id: 'fact-4',
        label: 'Mandatory uploader countryCode complies with ISO-3166 alpha-2',
        status: 'ruled_out',
        category: 'payload',
        details: 'Provided value "US" is recognized by schema standard.'
      }
    ]
  },
  {
    id: 'partner-ingress-502',
    name: 'Client Network & DNS 502 Bad Gateway (IdP SSO Expiration)',
    badge: 'Layer 1 DNS/SSO',
    summary: 'Ingress connection reset or SSO session token expiration on client endpoint',
    errorCode: '502 Bad Gateway',
    pipelineLayer: 'Layer 1: DNS / Client Network / IdP SSO',
    reportId: 'ING-7729103',
    assetReference: 'N/A',
    sampleFacts: [
      {
        id: 'fact-1',
        label: 'Client logs show no upload bottlenecks',
        status: 'ruled_out',
        category: 'network',
        details: 'Client curl times out during TCP handshake or receives RST packet.'
      },
      {
        id: 'fact-2',
        label: 'Edge Envoy proxy pods running and healthy',
        status: 'ruled_out',
        category: 'upstream',
        details: 'Kubernetes deployment 12/12 pods Ready; CPU utilization < 28%.'
      },
      {
        id: 'fact-3',
        label: 'Partner network route hitting correct Anycast PoP',
        status: 'confirmed_issue',
        category: 'network',
        details: 'Partner ISP BGP flap routing traffic to congested transit node rather than primary gateway.'
      }
    ]
  },
  {
    id: 'worker-queue-500',
    name: 'Worker Pod OOM During Large Asset Processing',
    badge: 'Layer 4 Workers',
    summary: 'Worker pod terminated with OOM during media hash extraction & archive assembly',
    errorCode: '500 Internal Server Error',
    pipelineLayer: 'Layer 4: Worker Queues / Async Processing Containers',
    reportId: 'WRK-5510294-Q',
    assetReference: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    sampleFacts: [
      {
        id: 'fact-1',
        label: 'Client logs show no upload bottlenecks',
        status: 'ruled_out',
        category: 'network',
        details: 'Upload to staging bucket completed with 100% integrity.'
      },
      {
        id: 'fact-2',
        label: 'Asset file size exceeds standard worker buffer (1.8GB)',
        status: 'confirmed_issue',
        category: 'payload',
        details: 'Stream processing attempted in-memory buffer rather than disk chunking.'
      },
      {
        id: 'fact-3',
        label: 'Task queue dead-letter routing captured message',
        status: 'ruled_out',
        category: 'queue',
        details: 'Message successfully moved to dead-letter queue after 3 retries.'
      }
    ]
  },
  {
    id: 'webhook-signature-401',
    name: 'Webhook Callback 401 HMAC Verification Failure',
    badge: 'Layer 6 Webhook',
    summary: 'Webhook delivery rejected by partner endpoint with signature error',
    errorCode: '401 Unauthorized',
    pipelineLayer: 'Layer 6: Webhook / Callback Notification',
    reportId: 'WHK-992104',
    assetReference: 'N/A',
    sampleFacts: [
      {
        id: 'fact-1',
        label: 'Client logs show no upload bottlenecks',
        status: 'ruled_out',
        category: 'network',
        details: 'Connection to partner webhook endpoint established in 42ms.'
      },
      {
        id: 'fact-2',
        label: 'Partner signing secret was rotated within last 24h',
        status: 'confirmed_issue',
        category: 'credentials',
        details: 'Partner updated signing secret in their portal but did not trigger active key synchronization.'
      },
      {
        id: 'fact-3',
        label: 'Payload raw string encoding UTF-8 canonicalized',
        status: 'ruled_out',
        category: 'payload',
        details: 'Bytes hashed prior to JSON serialization.'
      }
    ]
  }
];

export const PIPELINE_LAYERS_INFO: Record<string, {
  name: string;
  shortDesc: string;
  stepRange: string;
  criticalChecks: string[];
  commonErrors: string[];
  concreteExamples: {
    title: string;
    scenario: string;
    failureSymptom: string;
  }[];
}> = {
  'Layer 1: DNS / Client Network / IdP SSO': {
    name: 'DNS / Client Network / IdP SSO',
    shortDesc: 'Client-side DNS routing, Anycast network, TLS handshake, IdP SAML/OIDC SSO session tokens',
    stepRange: 'Layer 1: Network Ingress & Identity',
    criticalChecks: [
      'Client DNS resolution & Anycast latency',
      'TLS 1.2/1.3 cipher suite negotiation',
      'IdP SAML/OIDC token expiration & clock skew',
      'WAF rate limiting & Geo-IP filters'
    ],
    commonErrors: ['502 Bad Gateway', 'Connection Reset (ECONNRESET)', 'SSL_ERROR_SYSCALL', '403 WAF Blocked', 'SAML Response Expired'],
    concreteExamples: [
      {
        title: 'Browser Cache & Expired IdP SSO Session Token',
        scenario: 'A non-technical portal user attempts to submit a batch transaction after their corporate Okta/Azure AD session timed out 2 hours ago, but stale local storage tokens keep getting sent.',
        failureSymptom: 'Browser redirects into an infinite OAuth redirect loop or throws HTTP 401/403 with error="invalid_grant", "session_timed_out" on initial page load.'
      },
      {
        title: 'Anycast DNS Route Flap / Stale Geo-Cache',
        scenario: 'A partner in EU-West hits a stale DNS cache pointing to a decommissioned edge node, or a regional BGP route flap drops ingress TCP packets.',
        failureSymptom: 'cURL or SDK client hangs during initial SYN handshake and throws SSL_ERROR_SYSCALL or ECONNRESET before any HTTP request reaches the gateway.'
      }
    ]
  },
  'Layer 2: API Gateway / Authentication Edge': {
    name: 'API Gateway / Authentication Edge',
    shortDesc: 'Authentication tokens, Bearer validation, JSON/XML schema enforcement & rate limits',
    stepRange: 'Layer 2: Ingress & Auth Gate',
    criticalChecks: ['Bearer token validation & partner scope', 'JSON/XML schema compliance', 'Mandatory field format (timestamp, SHA-256)', 'Payload size headers'],
    commonErrors: ['401 Unauthorized', '403 Forbidden', '422 Unprocessable Entity', '429 Rate Limited'],
    concreteExamples: [
      {
        title: 'Expired OAuth2 Bearer Token in Long-Running Script',
        scenario: 'A partner cron runner script generates an OAuth token with 3600-second TTL at 06:00 UTC, but keeps reusing the same in-memory token for batch runs at 07:30 UTC.',
        failureSymptom: 'API Gateway returns HTTP 401 Unauthorized with WWW-Authenticate: Bearer error="invalid_token", error_description="The access token expired".'
      },
      {
        title: 'Schema Validation Failure on Datetime Format Offset',
        scenario: 'Partner ingestion payload sends incidentDateTime formatted as "2026-09-12 14:22:08 +0000" instead of strict ISO 8601 UTC ("2026-09-12T14:22:08Z").',
        failureSymptom: 'API Gateway schema validator drops the request immediately with HTTP 422 Unprocessable Entity: "field incidentDateTime does not conform to RFC3339/ISO8601 pattern".'
      }
    ]
  },
  'Layer 3: Storage Ingestion Service (DB write, asset retrieval)': {
    name: 'Storage Ingestion Service (DB write, asset retrieval)',
    shortDesc: 'Transaction persistence, database state write, signed storage URL validation & asset byte stream pull',
    stepRange: 'Steps 2–3: Storage Ingestion & DB Resolution',
    criticalChecks: ['S3/GCS presigned URL validity & TTL', 'Partner storage bucket ACL / KMS permissions', 'Direct HTTP GET range-requests', 'SHA-256 hash match against manifest'],
    commonErrors: ['403 Forbidden (SignatureDoesNotMatch / RequestExpired)', '404 Not Found (NoSuchKey)', '504 Gateway Timeout on Asset Stream'],
    concreteExamples: [
      {
        title: 'Presigned S3 Storage URL Expiration (Request has expired)',
        scenario: 'The partner generates an S3 presigned URL with an aggressive 15-minute expiration (X-Amz-Expires=900). Due to ingestion queue wait time or partner latency, the storage worker attempts the byte download 18 minutes later.',
        failureSymptom: 'S3 storage returns HTTP 403 Forbidden: Request has expired. Step 2 DB resolution succeeds, but Step 3 asset byte-stream download aborts.'
      },
      {
        title: 'Cross-Account KMS Key Permission Revocation',
        scenario: 'Files are stored in an enterprise AWS S3 bucket encrypted with customer-managed KMS keys (CMK). A scheduled partner IAM policy cleanup deletes the SaaS service principal role from the KMS Key Policy.',
        failureSymptom: 'Step 3 download fails with 403 AccessDenied: The ciphertext refers to a customer master key that does not exist or you do not have permission to access it.'
      }
    ]
  },
  'Layer 4: Worker Queues / Async Processing Containers': {
    name: 'Worker Queues / Async Processing Containers',
    shortDesc: 'Async message queues (Kafka/Celery), asset validation, chunking & dead-letter management',
    stepRange: 'Layer 4: Async Processing & Packaging',
    criticalChecks: ['Queue depth & consumer lag', 'Worker container memory (cgroups limit)', 'Temporary scratch disk volume capacity', 'Retry count & Dead Letter Queue (DLQ) state'],
    commonErrors: ['500 Worker OOM Killed', 'Queue Stalled (Consumer Disconnect)', '408 Task Timeout', 'Duplicate Message Processing'],
    concreteExamples: [
      {
        title: 'Worker OOM (Out-of-Memory) Container Eviction on Large File',
        scenario: 'A single incident report includes an uncompressed 3.8 GB video file. When the worker process attempts in-memory hash verification and chunking, memory breaches the container cgroups limit (4 GB).',
        failureSymptom: 'Linux kernel OOM killer terminates the worker pod with Signal 9 (Killed). Task disappears from active queue and causes consumer lag alerts in Datadog.'
      },
      {
        title: 'Corrupted Payload Routed to Dead Letter Queue (DLQ)',
        scenario: 'An uploaded file asset contains a corrupted header that causes the media parser library to throw an uncaught SegmentationFault / BufferOverflow.',
        failureSymptom: 'Task fails repeatedly across all 3 retry attempts, incrementing the DLQ counter and stranding the message in dead_letter_tasks table until manual DLQ replay.'
      }
    ]
  },
  'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)': {
    name: 'External Handshake (Downstream Partner API / Clearinghouse Gateway)',
    shortDesc: 'Downstream MTLS client authentication, SOAP/REST XML/JSON payload delivery & multipart asset transmission',
    stepRange: 'Steps 4–6: External Partner Handshake',
    criticalChecks: ['Client MTLS certificate chain & expiration', 'Downstream endpoint availability & maintenance status', 'Egress NAT IP whitelisting in downstream firewall', 'Downstream Transaction ID ACK receipt & error code parsing'],
    commonErrors: ['504 Gateway Timeout (Handshake stall)', '403 Forbidden (IP/Cert untrusted)', '500 Downstream Server Error', '400 Bad Schema Document'],
    concreteExamples: [
      {
        title: 'Outbound MTLS Client Certificate Expiration or Cipher Mismatch',
        scenario: 'The SaaS platform client certificate provisioned in the downstream partner portal expires at 00:00 UTC or fails intermediate CA trust chain validation during TLS renegotiation.',
        failureSymptom: 'Outbound Step 4 handshake aborts with OpenSSL error: certificate verify failed or alert bad certificate; TCP connection is terminated by partner server.'
      },
      {
        title: 'Downstream Ingest Timeout / Maintenance Congestion',
        scenario: 'Downstream receiver experiences elevated queue load or an unannounced maintenance window, causing the HTTP socket connection to hang past the 60-second read timeout.',
        failureSymptom: 'Step 4 wrapper reports HTTP 504 Gateway Timeout while packaging and transmitting multipart payload; report is routed to automatic retry queue.'
      }
    ]
  },
  'Layer 6: Webhook / Callback Notification': {
    name: 'Webhook / Callback Notification',
    shortDesc: 'Outbound webhook delivery, HMAC SHA-256 signatures, partner status confirmation & retry schedule',
    stepRange: 'Steps 4–6: Callback ACK & Delivery',
    criticalChecks: ['Partner webhook endpoint uptime', 'HMAC SHA-256 header generation', 'Clock skew / timestamp replay prevention', 'Exponential backoff retry schedule'],
    commonErrors: ['401 Unauthorized (Signature Mismatch)', '504 Gateway Timeout on partner receiver', '410 Gone / 404 Not Found endpoint'],
    concreteExamples: [
      {
        title: 'HMAC Webhook Signature Mismatch After Partner Secret Rotation',
        scenario: 'The partner rotates their shared webhook secret in the SaaS developer portal, but their receiver service is still configured with the deprecated key.',
        failureSymptom: 'Partner webhook listener calculates a conflicting SHA-256 digest and responds with HTTP 401 Unauthorized: "Invalid Webhook Signature".'
      },
      {
        title: 'Partner Endpoint Downtime & Exponential Backoff Exhaustion',
        scenario: 'The partner web service undergoes an outage or certificate expiration, consistently returning HTTP 502/504 to the webhook dispatcher.',
        failureSymptom: 'Dispatcher exhausts all 5 exponential backoff retries (1m, 5m, 15m, 1h, 4h). Incident status is marked DISPATCH_FAILED and triggers an operations alert.'
      }
    ]
  }
};

export const TELEMETRY_GUIDE = {
  reportId: {
    field: 'Transaction / Request ID',
    description: 'The unique tracking reference assigned by the client, edge API gateway, or downstream partner.',
    whatToEnter: 'Enter the exact transaction ID, request correlation ID, or downstream delivery ID found in the alert, logs, or customer ticket.',
    examples: [
      { id: 'TXN-2026-9821-X9', context: 'Standard Storage Ingestion Report Reference' },
      { id: 'EXT-API-8849102', context: 'Downstream Partner Transaction Reference' },
      { id: 'TXN-8392019-REST', context: 'Client Ingress Transaction UUID' },
      { id: 'req_01HZX829KJ8174', context: 'Edge Gateway Correlation / X-Request-ID' }
    ]
  },
  timestamp: {
    field: 'Timestamp (UTC)',
    description: 'The precise Coordinated Universal Time (UTC) when the error occurred or was logged in telemetry.',
    whatToEnter: 'Enter an ISO 8601 formatted UTC timestamp (YYYY-MM-DDTHH:mm:ssZ). Use UTC exclusively to avoid multi-timezone confusion across partner engineering, support, and NOC teams.',
    examples: [
      { id: '2026-09-12T14:22:08Z', context: 'Standard ISO 8601 UTC timestamp' },
      { id: '2026-09-12T15:10:45.120Z', context: 'High-precision telemetry timestamp with milliseconds' },
      { id: '2026-09-12T16:04:12Z', context: 'Alert trigger timestamp' }
    ]
  },
  assetReference: {
    field: 'Hash / Asset Reference',
    description: 'The cryptographic checksum (SHA-256) of the media/file asset, direct storage URI, or "N/A" for metadata-only errors.',
    whatToEnter: 'Enter the SHA-256 hash or storage URI of the failing file. If the failure is purely architectural (e.g. gateway auth 401, DNS reset, or MTLS timeout where no asset is involved), enter "N/A".',
    examples: [
      { id: 'sha256:d8a29b4e72cf1902c3851b4d32a9e35471a2e9b048cf7a1b029341bc8e390c12', context: 'SHA-256 File Digest' },
      { id: 's3://partner-storage-vault/evidence/batch-42/evidence-9821.jpg', context: 'Presigned S3 Object URI' },
      { id: 'N/A', context: 'Metadata / Handshake failure (no media implicated)' }
    ]
  }
};

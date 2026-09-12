// Telemetry and Error Code Catalog for Enterprise SaaS Incident Triage

export interface ErrorCodeDefinition {
  code: string;
  category: '4xx Client / Auth / Validation' | '5xx Server / Gateway / Infra' | '52x Edge & CDN Origin' | 'Network / Socket / TLS Exceptions';
  statusNumber: string;
  name: string;
  description: string;
  suggestedLayer: string;
}

export interface TransactionIdType {
  id: string;
  name: string;
  category: 'Standard SaaS' | 'Distributed Tracing' | 'Edge & Cloud' | 'Async & Messaging' | 'Enterprise & B2B';
  formatPattern: string;
  example: string;
  description: string;
  generate: () => string;
}

// Helpers for realistic random ID generators
function randomHex(length: number): string {
  let res = '';
  while (res.length < length) {
    res += Math.random().toString(16).substring(2);
  }
  return res.substring(0, length);
}

function randomAlphaNum(length: number): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function randomDigits(length: number): string {
  let res = '';
  for (let i = 0; i < length; i++) {
    res += Math.floor(Math.random() * 10).toString();
  }
  return res;
}

export const TRANSACTION_ID_TYPES: TransactionIdType[] = [
  {
    id: 'rep_internal',
    name: 'Internal Incident / Report ID',
    category: 'Standard SaaS',
    formatPattern: 'REP-YYYY-XXXX-XX',
    example: 'REP-2026-9821-X9',
    description: 'Standard enterprise incident tracking ticket and internal postmortem reference.',
    generate: () => `REP-2026-${randomAlphaNum(4)}-${randomAlphaNum(2)}`
  },
  {
    id: 'txn_payment',
    name: 'Transaction / Ingestion ID',
    category: 'Standard SaaS',
    formatPattern: 'TXN-YYYY-XXXXXXX-ALPHA',
    example: 'TXN-2026-8849102-ALPHA',
    description: 'Business transactional record identifier passed through ingestion pipelines.',
    generate: () => `TXN-2026-${randomDigits(7)}-ALPHA`
  },
  {
    id: 'uuid_request',
    name: 'X-Request-ID / UUIDv4',
    category: 'Distributed Tracing',
    formatPattern: 'req_xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
    example: 'req_c8a29b4e-72cf-4902-b385-1b4d32a9e354',
    description: 'Envoy, Nginx, or Kong edge ingress correlation header for individual HTTP requests.',
    generate: () => {
      const u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      return `req_${u}`;
    }
  },
  {
    id: 'w3c_traceparent',
    name: 'W3C Traceparent (OpenTelemetry)',
    category: 'Distributed Tracing',
    formatPattern: '00-32hex_trace_id-16hex_parent_id-01',
    example: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
    description: 'Standard W3C distributed tracing header used by OpenTelemetry, Jaeger, and Datadog.',
    generate: () => `00-${randomHex(32)}-${randomHex(16)}-01`
  },
  {
    id: 'aws_xray',
    name: 'AWS X-Ray Trace ID',
    category: 'Edge & Cloud',
    formatPattern: '1-8hex_timestamp-24hex_identifier',
    example: '1-64a821e0-8f9214b76a02b4e8912c3f91',
    description: 'AWS Application Load Balancer and API Gateway X-Amzn-Trace-Id header.',
    generate: () => {
      const epochHex = Math.floor(Date.now() / 1000).toString(16);
      return `1-${epochHex}-${randomHex(24)}`;
    }
  },
  {
    id: 'cloudflare_ray',
    name: 'Cloudflare Ray ID (CF-Ray)',
    category: 'Edge & Cloud',
    formatPattern: '16hex-[IATA Airport Code]',
    example: '8a2f10bc94e0192a-SJC',
    description: 'Cloudflare edge proxy request identifier for routing and edge security forensics.',
    generate: () => {
      const pops = ['SJC', 'IAD', 'LHR', 'FRA', 'NRT', 'ORD', 'DFW', 'AMS'];
      const pop = pops[Math.floor(Math.random() * pops.length)];
      return `${randomHex(16)}-${pop}`;
    }
  },
  {
    id: 'datadog_trace',
    name: 'Datadog Trace ID (64-bit uint)',
    category: 'Distributed Tracing',
    formatPattern: 'dd-trace-19digits',
    example: 'dd-trace-892109482019482910',
    description: 'Native Datadog APM trace identifier cross-correlated in log indexing and spans.',
    generate: () => `dd-trace-${randomDigits(18)}`
  },
  {
    id: 'partner_clearinghouse',
    name: 'Downstream Partner / Clearinghouse Ref',
    category: 'Enterprise & B2B',
    formatPattern: 'PARTNER-SYNC-XXXXXXX',
    example: 'PARTNER-SYNC-8849102',
    description: 'Mutual agreement reference provided by clearinghouses, banking rails, or EDI brokers.',
    generate: () => `PARTNER-SYNC-${randomDigits(7)}`
  },
  {
    id: 'sqs_msg_id',
    name: 'AWS SQS / Worker Message ID',
    category: 'Async & Messaging',
    formatPattern: 'sqs-msg-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    example: 'sqs-msg-7291a02b-4819-4b10-82a1-0941bc8e390c',
    description: 'Cloud queue message correlation ID for asynchronous background worker queues.',
    generate: () => {
      const u = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, () =>
        ((Math.random() * 16) | 0).toString(16)
      );
      return `sqs-msg-${u}`;
    }
  },
  {
    id: 'kafka_offset',
    name: 'Kafka Partition & Offset Key',
    category: 'Async & Messaging',
    formatPattern: 'kafka-topic-p[0-9]-offset-[0-9]+',
    example: 'kafka-events-p2-offset-1094820',
    description: 'Distributed event stream log offset tracking stalled or poison-pill consumer groups.',
    generate: () => `kafka-ingest-p${Math.floor(Math.random() * 8)}-offset-${randomDigits(7)}`
  },
  {
    id: 'batch_chunk',
    name: 'Ingestion Batch & Chunk ID',
    category: 'Standard SaaS',
    formatPattern: 'BATCH-YYYY-MM-XXXXX-CHUNK-XX',
    example: 'BATCH-2026-09-04412-CHUNK-03',
    description: 'Bulk file ingestion batch chunk coordinate for partitioned multipart uploads.',
    generate: () => `BATCH-2026-09-${randomDigits(5)}-CHUNK-0${Math.floor(Math.random() * 8) + 1}`
  },
  {
    id: 'webhook_event',
    name: 'Webhook Event / Delivery ID',
    category: 'Enterprise & B2B',
    formatPattern: 'evt_xxxxxxxxxxxxxxxxxxxxxx',
    example: 'evt_1OqJ3XE2eZvKYlo26vR4m09x',
    description: 'Stripe/GitHub style outbound webhook delivery notification ID for idempotency verification.',
    generate: () => `evt_${randomAlphaNum(22)}`
  },
  {
    id: 'asset_sha256',
    name: 'Asset Cryptographic SHA-256 Hash',
    category: 'Standard SaaS',
    formatPattern: 'sha256:64hex',
    example: 'sha256:d8a29b4e72cf1902c3851b4d32a9e35471a2e9b048cf7a1b029341bc8e390c12',
    description: 'Content-addressable storage hash verifying object identity and payload tamper-resistance.',
    generate: () => `sha256:${randomHex(64)}`
  },
  {
    id: 'edi_control',
    name: 'B2B EDI Interchange Control Number (X12)',
    category: 'Enterprise & B2B',
    formatPattern: 'ISA-00000XXXX-GS-XXXX',
    example: 'ISA-000004921-GS-8812',
    description: 'ANSI X12 / EDIFACT interchange control reference for enterprise clearinghouse transactions.',
    generate: () => `ISA-00000${randomDigits(4)}-GS-${randomDigits(4)}`
  }
];

// Full catalog of SaaS, API, Gateway, and Network Error Codes
export const FULL_ERROR_CODE_CATALOG: ErrorCodeDefinition[] = [
  // --- 4xx Client / Authentication / Validation ---
  {
    code: '400 Bad Request',
    statusNumber: '400',
    category: '4xx Client / Auth / Validation',
    name: 'Bad Request (Malformed Body / Missing Headers)',
    description: 'Client sent syntactically invalid JSON/XML payload or missing mandatory protocol headers.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '401 Unauthorized',
    statusNumber: '401',
    category: '4xx Client / Auth / Validation',
    name: 'Unauthorized (Bearer / API Key Expired or Invalid)',
    description: 'Missing, revoked, or expired OAuth Bearer token or invalid API credential signature.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '402 Payment Required',
    statusNumber: '402',
    category: '4xx Client / Auth / Validation',
    name: 'Payment Required (Quota / Plan Limit Exceeded)',
    description: 'Tenant billing tier credit exhausted or transactional ingestion allowance frozen.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '403 Forbidden',
    statusNumber: '403',
    category: '4xx Client / Auth / Validation',
    name: 'Forbidden (Presigned Expired / IAM Policy Denied)',
    description: 'Storage pre-signed URL TTL exceeded, KMS key revoked, or RBAC role lacks permission.',
    suggestedLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)'
  },
  {
    code: '404 Not Found',
    statusNumber: '404',
    category: '4xx Client / Auth / Validation',
    name: 'Not Found (Target Asset or Endpoint Missing)',
    description: 'Referenced report URI, target object key, or downstream endpoint does not exist.',
    suggestedLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)'
  },
  {
    code: '405 Method Not Allowed',
    statusNumber: '405',
    category: '4xx Client / Auth / Validation',
    name: 'Method Not Allowed (Verb Disallowed)',
    description: 'HTTP verb (e.g. GET instead of POST) not supported on target pipeline route.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '406 Not Acceptable',
    statusNumber: '406',
    category: '4xx Client / Auth / Validation',
    name: 'Not Acceptable (Content Negotiation Mismatch)',
    description: 'Ingress cannot generate response matching Accept headers requested by client.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '407 Proxy Authentication Required',
    statusNumber: '407',
    category: '4xx Client / Auth / Validation',
    name: 'Proxy Authentication Required (Egress Gateway Proxy)',
    description: 'Internal or partner egress forward-proxy requires proxy-authorization header.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: '408 Request Timeout',
    statusNumber: '408',
    category: '4xx Client / Auth / Validation',
    name: 'Request Timeout (Client Socket Idle)',
    description: 'Client connection timed out while transmitting request stream to edge proxy.',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },
  {
    code: '409 Conflict',
    statusNumber: '409',
    category: '4xx Client / Auth / Validation',
    name: 'Conflict (Duplicate Idempotency Key / State Lock)',
    description: 'Duplicate transaction report submission or concurrent optimistic lock collision.',
    suggestedLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)'
  },
  {
    code: '410 Gone',
    statusNumber: '410',
    category: '4xx Client / Auth / Validation',
    name: 'Gone (Resource Deprecated / Permanently Purged)',
    description: 'Target ingestion batch or historical report has expired retention policy.',
    suggestedLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)'
  },
  {
    code: '412 Precondition Failed',
    statusNumber: '412',
    category: '4xx Client / Auth / Validation',
    name: 'Precondition Failed (If-Match ETag Mismatch)',
    description: 'Mid-stream conditional update failed because resource ETag changed on server.',
    suggestedLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)'
  },
  {
    code: '413 Payload Too Large',
    statusNumber: '413',
    category: '4xx Client / Auth / Validation',
    name: 'Payload Too Large (Exceeds Gateway Ingestion Limit)',
    description: 'Payload body size exceeded max body limit (e.g. 50MB) on API gateway or proxy.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '414 URI Too Long',
    statusNumber: '414',
    category: '4xx Client / Auth / Validation',
    name: 'URI Too Long (Query Parameter Overflow)',
    description: 'Presigned query string or filter parameters exceeded HTTP server URI buffer limits.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '415 Unsupported Media Type',
    statusNumber: '415',
    category: '4xx Client / Auth / Validation',
    name: 'Unsupported Media Type (Content-Type Header Mismatch)',
    description: 'Payload supplied text/plain or invalid MIME instead of expected application/json.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '416 Range Not Satisfiable',
    statusNumber: '416',
    category: '4xx Client / Auth / Validation',
    name: 'Range Not Satisfiable (Chunked Upload Out of Bounds)',
    description: 'Multipart chunk byte range exceeds the total verified asset byte size.',
    suggestedLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)'
  },
  {
    code: '422 Unprocessable Entity',
    statusNumber: '422',
    category: '4xx Client / Auth / Validation',
    name: 'Unprocessable Entity (Schema Semantic Validation Failure)',
    description: 'Well-formed JSON failed schema rules: missing required field, regex mismatch, or date format error.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '423 Locked',
    statusNumber: '423',
    category: '4xx Client / Auth / Validation',
    name: 'Locked (Asset Currently Mutating in Worker)',
    description: 'Asset or transaction report is currently locked by a running worker container.',
    suggestedLayer: 'Layer 4: Worker Queues / Async Processing Containers'
  },
  {
    code: '424 Failed Dependency',
    statusNumber: '424',
    category: '4xx Client / Auth / Validation',
    name: 'Failed Dependency (Preceding Ingestion Step Failed)',
    description: 'Downstream execution aborted because prior database lookup or manifest fetch failed.',
    suggestedLayer: 'Layer 4: Worker Queues / Async Processing Containers'
  },
  {
    code: '426 Upgrade Required',
    statusNumber: '426',
    category: '4xx Client / Auth / Validation',
    name: 'Upgrade Required (TLS / HTTP Protocol Upgrade)',
    description: 'Client must upgrade cipher suite or switch from plain HTTP/1.1 to TLS 1.3 / HTTP/2.',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },
  {
    code: '429 Too Many Requests',
    statusNumber: '429',
    category: '4xx Client / Auth / Validation',
    name: 'Too Many Requests (Rate Limit / Token Bucket Throttled)',
    description: 'Client exceeded rate limit thresholds (e.g. 100 req/sec) enforced by Redis token bucket.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '431 Request Header Fields Too Large',
    statusNumber: '431',
    category: '4xx Client / Auth / Validation',
    name: 'Request Header Fields Too Large (JWT Cookie Overflow)',
    description: 'OAuth token or identity cookies exceed gateway maximum HTTP header buffer size.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '499 Client Closed Request',
    statusNumber: '499',
    category: '4xx Client / Auth / Validation',
    name: 'Client Closed Request (Nginx / Envoy Client Abort)',
    description: 'Client terminated socket connection before server could complete and return response.',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },

  // --- 5xx Server / Gateway / Infrastructure ---
  {
    code: '500 Internal Server Error',
    statusNumber: '500',
    category: '5xx Server / Gateway / Infra',
    name: 'Internal Server Error (Unhandled Exception / DB Crash)',
    description: 'Service encountered an unhandled panic, database connection pool exhaustion, or crash.',
    suggestedLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)'
  },
  {
    code: '501 Not Implemented',
    statusNumber: '501',
    category: '5xx Server / Gateway / Infra',
    name: 'Not Implemented (Endpoint Routing Stub)',
    description: 'Target pipeline protocol handler or callback version is not yet deployed on server.',
    suggestedLayer: 'Layer 2: API Gateway / Authentication Edge'
  },
  {
    code: '502 Bad Gateway',
    statusNumber: '502',
    category: '5xx Server / Gateway / Infra',
    name: 'Bad Gateway (Upstream Microservice Crash / Envoy Reset)',
    description: 'Reverse proxy received invalid response or unexpected TCP termination from upstream container.',
    suggestedLayer: 'Layer 4: Worker Queues / Async Processing Containers'
  },
  {
    code: '503 Service Unavailable',
    statusNumber: '503',
    category: '5xx Server / Gateway / Infra',
    name: 'Service Unavailable (Circuit Breaker Tripped / Maintenance)',
    description: 'Worker queue pool exhausted, circuit breaker in open state, or scheduled failover active.',
    suggestedLayer: 'Layer 4: Worker Queues / Async Processing Containers'
  },
  {
    code: '504 Gateway Timeout',
    statusNumber: '504',
    category: '5xx Server / Gateway / Infra',
    name: 'Gateway Timeout (Downstream Partner / Clearinghouse Timeout)',
    description: 'Upstream gateway failed to respond within observational window (e.g. 30s) during outbound handshake.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: '505 HTTP Version Not Supported',
    statusNumber: '505',
    category: '5xx Server / Gateway / Infra',
    name: 'HTTP Version Not Supported',
    description: 'Origin server rejects major HTTP protocol version used in incoming connection.',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },
  {
    code: '507 Insufficient Storage',
    statusNumber: '507',
    category: '5xx Server / Gateway / Infra',
    name: 'Insufficient Storage (Worker Disk Scratch Space Full)',
    description: 'Worker ephemeral disk (/tmp or volume mount) ran out of storage while unpacking asset.',
    suggestedLayer: 'Layer 4: Worker Queues / Async Processing Containers'
  },
  {
    code: '508 Loop Detected',
    statusNumber: '508',
    category: '5xx Server / Gateway / Infra',
    name: 'Loop Detected (Circular Webhook / Proxy Routing Loop)',
    description: 'Infinite loop detected during webhook routing or redirect chain.',
    suggestedLayer: 'Layer 6: Webhook / Callback Notification'
  },
  {
    code: '511 Network Authentication Required',
    statusNumber: '511',
    category: '5xx Server / Gateway / Infra',
    name: 'Network Authentication Required (Captive Portal / Proxy)',
    description: 'Client must authenticate to corporate proxy or network gateway before gaining internet transit.',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },

  // --- 52x Edge & CDN Origin Errors ---
  {
    code: '520 Web Server Returned an Unknown Error',
    statusNumber: '520',
    category: '52x Edge & CDN Origin',
    name: '520 Unknown Origin Error (Cloudflare Edge Catch-All)',
    description: 'Origin server returned an empty, unknown, or inexplicable response to Cloudflare proxy.',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },
  {
    code: '521 Web Server Is Down',
    statusNumber: '521',
    category: '52x Edge & CDN Origin',
    name: '521 Web Server Is Down (Origin Refused TCP Connection)',
    description: 'Origin web server refused TCP connection on port 443/80; daemon is stopped or firewall is blocking.',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },
  {
    code: '522 Connection Timed Out',
    statusNumber: '522',
    category: '52x Edge & CDN Origin',
    name: '522 Connection Timed Out (TCP SYN Handshake Timeout)',
    description: 'Cloudflare edge could not complete 3-way TCP handshake with origin server within 15 seconds.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: '523 Origin Is Unreachable',
    statusNumber: '523',
    category: '52x Edge & CDN Origin',
    name: '523 Origin Is Unreachable (BGP Routing / IP Failure)',
    description: 'Network route to origin IP could not be established; BGP routing failure or incorrect DNS record.',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },
  {
    code: '524 A Timeout Occurred',
    statusNumber: '524',
    category: '52x Edge & CDN Origin',
    name: '524 A Timeout Occurred (Origin HTTP Response Timeout)',
    description: 'TCP connection established, but origin server failed to send HTTP response headers within 100 seconds.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: '525 SSL Handshake Failed',
    statusNumber: '525',
    category: '52x Edge & CDN Origin',
    name: '525 SSL Handshake Failed (Origin TLS / Cipher Negotiation Failure)',
    description: 'SSL/TLS negotiation between edge proxy and origin failed; cipher mismatch or missing SNI.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: '526 Invalid SSL Certificate',
    statusNumber: '526',
    category: '52x Edge & CDN Origin',
    name: '526 Invalid SSL Certificate (Untrusted / Expired Origin Cert)',
    description: 'Origin server presented an expired, self-signed, or untrusted TLS certificate to proxy in Full (Strict) mode.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },

  // --- Network / Socket / TLS Exceptions ---
  {
    code: 'ECONNRESET',
    statusNumber: 'SOCK',
    category: 'Network / Socket / TLS Exceptions',
    name: 'ECONNRESET (Connection Reset by Peer / TCP RST)',
    description: 'Remote partner endpoint abruptly closed TCP socket with an ungraceful RST packet.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: 'ECONNREFUSED',
    statusNumber: 'SOCK',
    category: 'Network / Socket / TLS Exceptions',
    name: 'ECONNREFUSED (Connection Refused by Destination Port)',
    description: 'No daemon listening on target host:port, or partner egress firewall dropped SYN packet.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: 'ETIMEDOUT',
    statusNumber: 'SOCK',
    category: 'Network / Socket / TLS Exceptions',
    name: 'ETIMEDOUT (TCP Socket Connect Timeout)',
    description: 'TCP handshake attempt timed out with no response from remote server.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: 'EHOSTUNREACH',
    statusNumber: 'SOCK',
    category: 'Network / Socket / TLS Exceptions',
    name: 'EHOSTUNREACH (No Route to Host / VPC Peering Broken)',
    description: 'Operating system IP stack could not find route to destination IP (VPC peering or gateway down).',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },
  {
    code: 'ENOTFOUND',
    statusNumber: 'SOCK',
    category: 'Network / Socket / TLS Exceptions',
    name: 'ENOTFOUND (DNS Resolution Failure / NXDOMAIN)',
    description: 'DNS resolver failed to find IP address for hostname (NXDOMAIN or DNS server timeout).',
    suggestedLayer: 'Layer 1: DNS / Client Network / IdP SSO'
  },
  {
    code: 'EPIPE',
    statusNumber: 'SOCK',
    category: 'Network / Socket / TLS Exceptions',
    name: 'EPIPE (Broken Pipe During Streaming Byte Write)',
    description: 'Attempted to write bytes to socket after remote peer has already closed connection.',
    suggestedLayer: 'Layer 3: Storage Ingestion Service (DB write, asset retrieval)'
  },
  {
    code: 'CERT_HAS_EXPIRED',
    statusNumber: 'TLS',
    category: 'Network / Socket / TLS Exceptions',
    name: 'CERT_HAS_EXPIRED (Mutual TLS Client/Server Cert Expired)',
    description: 'X.509 certificate notAfter timestamp has elapsed; MTLS authentication rejected.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: 'DEPTH_ZERO_SELF_SIGNED_CERT',
    statusNumber: 'TLS',
    category: 'Network / Socket / TLS Exceptions',
    name: 'DEPTH_ZERO_SELF_SIGNED_CERT (Untrusted Self-Signed Certificate)',
    description: 'Certificate authority is self-signed and not present in container local CA trust bundle.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: 'ERR_TLS_CERT_ALTNAME_INVALID',
    statusNumber: 'TLS',
    category: 'Network / Socket / TLS Exceptions',
    name: 'ERR_TLS_CERT_ALTNAME_INVALID (Hostname / SAN Mismatch)',
    description: 'Subject Alternative Name (SAN) in TLS certificate does not match requested destination domain.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  },
  {
    code: 'SSL_ERROR_SYSCALL',
    statusNumber: 'TLS',
    category: 'Network / Socket / TLS Exceptions',
    name: 'SSL_ERROR_SYSCALL (OpenSSL Protocol / Handshake EOF)',
    description: 'Low-level OpenSSL I/O failure during TLS handshake negotiation.',
    suggestedLayer: 'Layer 5: External Handshake (Downstream Partner API / Clearinghouse Gateway)'
  }
];

// Quick shortcut lists for UI chips
export const POPULAR_ERROR_CODES = [
  '403 Forbidden',
  '504 Gateway Timeout',
  '422 Unprocessable Entity',
  '502 Bad Gateway',
  '500 Internal Server Error',
  '401 Unauthorized',
  '429 Too Many Requests',
  'ECONNRESET',
  'ETIMEDOUT'
];

export const POPULAR_TRANSACTION_FORMATS = [
  { label: 'REP-ID', id: 'rep_internal' },
  { label: 'W3C Trace', id: 'w3c_traceparent' },
  { label: 'UUIDv4', id: 'uuid_request' },
  { label: 'AWS X-Ray', id: 'aws_xray' },
  { label: 'CF-Ray', id: 'cloudflare_ray' },
  { label: 'Partner Sync', id: 'partner_clearinghouse' },
  { label: 'SQS Msg', id: 'sqs_msg_id' },
  { label: 'SHA-256', id: 'asset_sha256' }
];

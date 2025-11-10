import { SignedVerifiableCredential } from '../types';

export const bbs2020CredentialV1_1: SignedVerifiableCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
    'https://trustvc.io/context/transferable-records-context.json',
    'https://trustvc.io/context/render-method-context.json',
    'https://trustvc.io/context/attachments-context.json',
    'https://trustvc.io/context/qrcode-context.json',
    'https://trustvc.io/context/bill-of-lading.json',
  ],
  qrCode: { type: 'TrustVCQRCode', uri: 'https://localhost:3000/qrcode' },
  credentialStatus: {
    type: 'TransferableRecords',
    tokenNetwork: { chain: 'MATIC', chainId: '80001' },
    tokenRegistry: '0xE0a94770B8e969B5D9179d6dA8730B01e19279e2',
    tokenId: '0f6cda4d977bae4a92f55133cd64926a8b91d4239984dc1184dc9337463c2687',
  },
  credentialSubject: {
    billOfLadingName: 'TrustVC Bill of Lading',
    scac: 'SGPU',
    blNumber: 'SGCNM21566325',
    vessel: 'vessel',
    voyageNo: 'voyageNo',
    portOfLoading: 'Singapore',
    portOfDischarge: 'Paris',
    carrierName: 'A.P. Moller',
    placeOfReceipt: 'Beijing',
    placeOfDelivery: 'Singapore',
    packages: [
      { packagesDescription: 'package 1', packagesWeight: '10', packagesMeasurement: '20' },
      { packagesDescription: 'package 2', packagesWeight: '10', packagesMeasurement: '20' },
    ],
    shipperName: 'Shipper Name',
    shipperAddressStreet: '101 ORCHARD ROAD',
    shipperAddressCountry: 'SINGAPORE',
    consigneeName: 'Consignee name',
    notifyPartyName: 'Notify Party Name',
    links: 'https://localhost:3000/url',
    attachments: [
      { data: 'BASE64_ENCODED_FILE', filename: 'sample1.pdf', mimeType: 'application/pdf' },
      { data: 'BASE64_ENCODED_FILE', filename: 'sample2.pdf', mimeType: 'application/pdf' },
    ],
    type: ['BillOfLading'],
  },
  renderMethod: [
    {
      id: 'https://localhost:3000/renderer',
      type: 'EMBEDDED_RENDERER',
      templateName: 'BILL_OF_LADING',
    },
  ],
  expirationDate: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: ['VerifiableCredential'],
  issuanceDate: '2024-04-01T12:19:52Z',
  id: 'urn:bnid:_:01994c0f-c112-7446-b6a9-38a6bfbcfc5a',
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2025-09-15T06:28:45Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      't43CydjSQLq5cLDxdnBf9c27ijWARBCW98RqoAn5WZzWIVaHhAmhUAhKXVelsIDXBqdyy/7UdRyvqvWX+lMz3n1Jvp+5o/lD1ckOxrWuG2c6vSa3nqU6MAxVvq9dOnUeAgQTrkpXhXuwNoYtR33vFQ==',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
  },
};

export const bbs2020DerivedCredentialV1_1: SignedVerifiableCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/bbs/v1',
    'https://w3id.org/vc/status-list/2021/v1',
    'https://trustvc.io/context/transferable-records-context.json',
    'https://trustvc.io/context/render-method-context.json',
    'https://trustvc.io/context/attachments-context.json',
    'https://trustvc.io/context/qrcode-context.json',
    'https://trustvc.io/context/bill-of-lading.json',
  ],
  id: 'urn:bnid:_:01994c0f-c112-7446-b6a9-38a6bfbcfc5a',
  type: 'VerifiableCredential',
  qrCode: {
    id: 'urn:bnid:_:c14n6',
    type: 'TrustVCQRCode',
    uri: 'https://localhost:3000/qrcode',
  },
  renderMethod: [
    {
      '@id': 'urn:bnid:_:c14n2',
      id: 'https://localhost:3000/renderer',
      templateName: 'BILL_OF_LADING',
      type: 'EMBEDDED_RENDERER',
    },
  ],
  credentialStatus: {
    id: 'urn:bnid:_:c14n0',
    type: 'TransferableRecords',
    tokenId: '0f6cda4d977bae4a92f55133cd64926a8b91d4239984dc1184dc9337463c2687',
    tokenNetwork: { id: 'urn:bnid:_:c14n1', chain: 'MATIC', chainId: '80001' },
    tokenRegistry: '0xE0a94770B8e969B5D9179d6dA8730B01e19279e2',
  },
  credentialSubject: {
    id: 'urn:bnid:_:c14n5',
    type: 'BillOfLading',
    billOfLadingName: 'TrustVC Bill of Lading',
    blNumber: 'SGCNM21566325',
    shipperName: 'Shipper Name',
    packages: [
      {
        id: 'urn:bnid:_:c14n3',
        packagesDescription: 'package 1',
        packagesMeasurement: '20',
        packagesWeight: '10',
      },
      {
        id: 'urn:bnid:_:c14n8',
        packagesDescription: 'package 2',
        packagesMeasurement: '20',
        packagesWeight: '10',
      },
    ],
    attachments: [
      {
        id: 'urn:bnid:_:c14n4',
        data: 'BASE64_ENCODED_FILE',
        filename: 'sample2.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'urn:bnid:_:c14n7',
        data: 'BASE64_ENCODED_FILE',
        filename: 'sample1.pdf',
        mimeType: 'application/pdf',
      },
    ],
  },
  expirationDate: '2029-12-03T12:19:52Z',
  issuanceDate: '2024-04-01T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  proof: {
    type: 'BbsBlsSignatureProof2020',
    created: '2025-09-15T06:28:45Z',
    nonce: 'PT3EpqO7oPMhsS3jW8Q8FeEqooe10H00APHM/ub1HMuGYlASd6SdrHvQefjwRSTYRxs=',
    proofPurpose: 'assertionMethod',
    proofValue:
      'ADgA//IAP////4C4R21VMhthwYh3LFiS2DEM4ZhiK+/0PXiGJdiiH4ezNSPWE72ib2akIxoKCG4KfpNOnAa0fOnxB4NP3+CqOeMCOy+zkw6NoEEwW1rQpZ71nGmx/0zPvultMUvVyyrgVa8XYW2lXuKk0nV7/CNeQB8KRhyVProFTLQTL+/Fi4IbBnGwXDdhkefhnoJXVkWv7QAAAHSja8XIvjo7HnfkXsYJNEejfsJfGeXY5q+/flm4s3evvnD4vLGFYreumGMblT4lGGkAAAACWETb3IlZvmWZcK7Gi0b4wKj2E6xPNw5Kw8FZ6rvKTMEK6ywNvxGMYSx5jR3JmvgOZuykA9nnsfw062F5mZkPspcdx/58XIl/QzKqDly5/5o5Rg16Tjx8noZ4v8+OIpRMs6YFuZx8GKDvElvRh8jvbgAAAA8mO/dQhW8va9SDksr5JlSNZOlQ6/0vMWiR9bRHDqe5eDF6aGrgqbuwcw1AcveclumDy4JqMGB9Qn9mBRZSLhbIGphtQd1h7MvlIC8nMsZQq320I/zjS3btmnwFal3OXLc5nV7AgAOuMlfqtTl8MYSf93kMDjL6unfHMU5gPEd0UwXkLBsfEt0zrv9bRgG++EOMw4OtOjZ96n5GrfhqCRfZbfUnJRBtH/5F/EOeUmAveILJ08TUezJC/Z1vDJ3Moog5jQrxtHJ/U2AKbKvsow1K8BWn6PLDoSwYWYK3M1+Wcyf8DnM0TTZKhdcSPe45ZawktgMg74uIkg4Kbt/lPQFWcX8mwLAzukkuXYT3XhPIF88EzKtcNic/BAHZJFMzzQthNZFPuTX+3GDsDErxyEgZnedeHKZpfQdGzo/u9SoMTzjLmSrDTxeSG8J90eL4Jov0YvW7IcNg+vk56m36OFWHOaDb+SDY3GZGdSODyfWGyrMuwcVd/LG9ArVq2iodstEMhTAW9HS7B6fz5zp5eD0/de6rsORn7XkOHqsW3vj94VXikfUKow3z4MH0nJxTG4W1OPZn2vgxaXuCeQx8Yb/FQwUo+p3t5WTRIRI/Mw7XtFbfGJ6nY5wSDsmRsCvFd94=',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
  },
};

export const bbs2020CredentialV2_0: SignedVerifiableCredential = {
  '@context': [
    'https://www.w3.org/ns/credentials/v2',
    'https://w3id.org/security/bbs/v1',
    'https://trustvc.io/context/transferable-records-context.json',
    'https://trustvc.io/context/render-method-context-v2.json',
    'https://trustvc.io/context/attachments-context.json',
    'https://trustvc.io/context/qrcode-context.json',
    'https://trustvc.io/context/bill-of-lading.json',
  ],
  qrCode: { type: 'TrustVCQRCode', uri: 'https://localhost:3000/qrcode' },
  credentialStatus: {
    type: 'TransferableRecords',
    tokenNetwork: { chain: 'MATIC', chainId: '80001' },
    tokenRegistry: '0xE0a94770B8e969B5D9179d6dA8730B01e19279e2',
    tokenId: 'f247599c416a3d55423495ef87cb188776e43553e91dcaeae5e60740719a1976',
  },
  credentialSubject: {
    billOfLadingName: 'TrustVC Bill of Lading',
    scac: 'SGPU',
    blNumber: 'SGCNM21566325',
    vessel: 'vessel',
    voyageNo: 'voyageNo',
    portOfLoading: 'Singapore',
    portOfDischarge: 'Paris',
    carrierName: 'A.P. Moller',
    placeOfReceipt: 'Beijing',
    placeOfDelivery: 'Singapore',
    packages: [
      { packagesDescription: 'package 1', packagesWeight: '10', packagesMeasurement: '20' },
      { packagesDescription: 'package 2', packagesWeight: '10', packagesMeasurement: '20' },
    ],
    shipperName: 'Shipper Name',
    shipperAddressStreet: '101 ORCHARD ROAD',
    shipperAddressCountry: 'SINGAPORE',
    consigneeName: 'Consignee name',
    notifyPartyName: 'Notify Party Name',
    links: 'https://localhost:3000/url',
    attachments: [
      { data: 'BASE64_ENCODED_FILE', filename: 'sample1.pdf', mimeType: 'application/pdf' },
      { data: 'BASE64_ENCODED_FILE', filename: 'sample2.pdf', mimeType: 'application/pdf' },
    ],
    type: ['BillOfLading'],
  },
  renderMethod: [
    {
      id: 'https://localhost:3000/renderer',
      type: 'EMBEDDED_RENDERER',
      templateName: 'BILL_OF_LADING',
    },
  ],
  validUntil: '2029-12-03T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  type: ['VerifiableCredential'],
  validFrom: '2024-04-01T12:19:52Z',
  id: 'urn:bnid:_:01995667-2960-722f-9869-959a7fd07150',
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2025-09-17T06:40:25Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'p7vUXYbUqm7i5QDQKRoprc/q/yqNNAqNTA6xSa7XjORZ03u4S8APmU+9cIrV4ZMrB0sky130H7U+VSQVJfpFd9LGuZ6XC32nJkR3pbhxPzwdY+b5HaUFcGQQ3NJQAxz5xmqkSKY7WXiPqFKf/Beuaw==',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
  },
};

export const bbs2020DerivedCredentialV2_0: SignedVerifiableCredential = {
  '@context': [
    'https://www.w3.org/ns/credentials/v2',
    'https://w3id.org/security/bbs/v1',
    'https://trustvc.io/context/transferable-records-context.json',
    'https://trustvc.io/context/render-method-context-v2.json',
    'https://trustvc.io/context/attachments-context.json',
    'https://trustvc.io/context/qrcode-context.json',
    'https://trustvc.io/context/bill-of-lading.json',
  ],
  id: 'urn:bnid:_:01995667-2960-722f-9869-959a7fd07150',
  type: 'VerifiableCredential',
  qrCode: {
    id: 'urn:bnid:_:c14n3',
    type: 'TrustVCQRCode',
    uri: 'https://localhost:3000/qrcode',
  },
  renderMethod: [
    {
      id: 'https://localhost:3000/renderer',
      templateName: 'BILL_OF_LADING',
      type: 'EMBEDDED_RENDERER',
    },
  ],
  credentialStatus: {
    id: 'urn:bnid:_:c14n0',
    type: 'TransferableRecords',
    tokenId: 'f247599c416a3d55423495ef87cb188776e43553e91dcaeae5e60740719a1976',
    tokenNetwork: { id: 'urn:bnid:_:c14n1', chain: 'MATIC', chainId: '80001' },
    tokenRegistry: '0xE0a94770B8e969B5D9179d6dA8730B01e19279e2',
  },
  credentialSubject: {
    id: 'urn:bnid:_:c14n5',
    type: 'BillOfLading',
    billOfLadingName: 'TrustVC Bill of Lading',
    blNumber: 'SGCNM21566325',
    shipperName: 'Shipper Name',
    packages: [
      {
        id: 'urn:bnid:_:c14n2',
        packagesDescription: 'package 1',
        packagesMeasurement: '20',
        packagesWeight: '10',
      },
      {
        id: 'urn:bnid:_:c14n7',
        packagesDescription: 'package 2',
        packagesMeasurement: '20',
        packagesWeight: '10',
      },
    ],
    attachments: [
      {
        id: 'urn:bnid:_:c14n4',
        data: 'BASE64_ENCODED_FILE',
        filename: 'sample2.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'urn:bnid:_:c14n6',
        data: 'BASE64_ENCODED_FILE',
        filename: 'sample1.pdf',
        mimeType: 'application/pdf',
      },
    ],
  },
  validUntil: '2029-12-03T12:19:52Z',
  validFrom: '2024-04-01T12:19:52Z',
  issuer: 'did:web:trustvc.github.io:did:1',
  proof: {
    type: 'BbsBlsSignatureProof2020',
    created: '2025-09-17T06:40:25Z',
    nonce: 'AVF+U0Wv7Un4OLmZ1JdGSh52zkmorNOncBs2MzuFn+BI7HeIVDQdLsusV57u7ghyWOw=',
    proofPurpose: 'assertionMethod',
    proofValue:
      'ADd/5AB/////qcx//X8Ll0Y76W4/xUFxxfy8RtX7h6IAVyHknG39MSR2sXKJ2HofXrBZU7aKCos0kvT5fUFr2KfuFL2bynKTQWYoXrXs+xLoxw6OvlvSNYuBq43B780lqgaoC0E8fKb+grA5rXOl7bklgLQxyinq9RTQJOKS7i6nBi6Fo0heBHCx6RX43dxdI0rvAg9QYwmPAAAAdJjk71Wh4YYVRZOPUU5CPdFaVXHce4ZuOzoGhTzgxVF+J44ak+JnGpv3FpaGNahX5AAAAAJOEoIWKyJcaQ3FoNnPtrW6XK4Ce2+wHb6vBIhhRaG0fGFjbsPU2SBWcfPXTdr2V60xidu0A3QC+73cN/hW9RfwpaBQ9KhFQijSFjWku5ZpxUxavAcliupG8rLAVeRRueGsfg08gsFcScyrAwrVBYwAAAAADwsnudyX1IcmJGcmO92k9SfTvnln2TQ0zpZE7TFdkaMCXrkAIpjmP0bZLAdsyo2Zi6R1R08MZJDgRoRYgAevhSIwdtRe0XkendSriPpRwCNheCZi1Rkoh5u8LJX+FdfuZ1g+MdxEdDeKzIjHPHJo4E+2bxT2eqSby0ZHDjxLSBkKHvkjjdc7P92zUP397lKSJ7MxlKN7fQ/2YUaygjDaLsIbfD/76sjJQyBJDo2tGXys/GaJ1aasp1FRf3QUGr1VIhNlpl2OA3wsMdFOnvgueEn122aF0GX1VWECxqDQPnkNHHC5WKdexFxxdUyXiVG5agIH+ajApOM0TUgwpKuZUpkd20v3SD5g5gPuaw5gpEbKjJuuBjlauD8jUeb8l6iu2DeDTgCDeuEU0Ie0MHJFWFR06yDR7RkOsLmo4Dqdg7MaIRXEkgvo/MULe4sn5bAwzG4nycQ8Zc0bIz4tKBCm5rE+m4P3RuQ7AONyzf9BpRH0rradIlHVfKpub+g+AnoDKy+OSOd2kTwgfKt5s/R+8NW6WDhdA8Br+poi83QdFwnyGJwiuGHTEx1H2oWTIKLXmAUaKj5VczzkhFv0pPDiacsoKskKjBdtP+/DbMZ1YXN0x8aFlddoLpQbC9m5ng3B/g==',
    verificationMethod: 'did:web:trustvc.github.io:did:1#keys-1',
  },
};

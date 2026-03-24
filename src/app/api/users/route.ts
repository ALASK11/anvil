import { GoogleAuth } from 'google-auth-library'
import { NextRequest, NextResponse } from 'next/server'

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'anvil-private'
const REGION = process.env.GCP_REGION || 'us-central1'
const SERVICE_NAME = process.env.CLOUD_RUN_SERVICE || 'private-nextjs-site'

const RUN_BASE = `https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/services/${SERVICE_NAME}`

async function getAuthClient() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
  return auth.getClient()
}

// GET — list current IAM members with run.invoker role
export async function GET() {
  try {
    const client = await getAuthClient()
    const res = await client.request({ url: `${RUN_BASE}:getIamPolicy` })
    const policy = res.data as { bindings?: Array<{ role: string; members: string[] }> }

    const invokerBinding = policy.bindings?.find(
      (b) => b.role === 'roles/run.invoker'
    )

    const members = (invokerBinding?.members || [])
      .filter((m: string) => m.startsWith('user:'))
      .map((m: string) => {
        const email = m.replace('user:', '')
        return { email, member: m }
      })

    return NextResponse.json({ members })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — add a user to both run.invoker and iap.httpsResourceAccessor
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const client = await getAuthClient()
    const member = `user:${email}`

    // 1. Add to Cloud Run invoker
    const policyRes = await client.request({ url: `${RUN_BASE}:getIamPolicy` })
    const policy = policyRes.data as {
      bindings?: Array<{ role: string; members: string[] }>
      etag?: string
    }

    const bindings = policy.bindings || []
    const invokerBinding = bindings.find((b) => b.role === 'roles/run.invoker')

    if (invokerBinding) {
      if (!invokerBinding.members.includes(member)) {
        invokerBinding.members.push(member)
      }
    } else {
      bindings.push({ role: 'roles/run.invoker', members: [member] })
    }

    await client.request({
      url: `${RUN_BASE}:setIamPolicy`,
      method: 'POST',
      data: {
        policy: { bindings, etag: policy.etag },
      },
    })

    // Fetch Project Number for IAP API
    const rmRes = await client.request({ url: `https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT_ID}` })
    const projectNumber = (rmRes.data as { projectNumber: string }).projectNumber

    // 2. Add IAP httpsResourceAccessor via gcloud-style API
    const iapResource = `projects/${projectNumber}/iap_web/cloud_run-${REGION}/services/${SERVICE_NAME}`
    const iapBase = `https://iap.googleapis.com/v1/${iapResource}`

    const iapPolicyRes = await client.request({
      url: `${iapBase}:getIamPolicy`,
      method: 'POST',
      data: { options: { requestedPolicyVersion: 3 } }
    })
    const iapPolicy = iapPolicyRes.data as {
      bindings?: Array<{ role: string; members: string[] }>
      etag?: string
    }

    const iapBindings = iapPolicy.bindings || []
    const iapBinding = iapBindings.find(
      (b) => b.role === 'roles/iap.httpsResourceAccessor'
    )

    if (iapBinding) {
      if (!iapBinding.members.includes(member)) {
        iapBinding.members.push(member)
      }
    } else {
      iapBindings.push({
        role: 'roles/iap.httpsResourceAccessor',
        members: [member],
      })
    }

    await client.request({
      url: `${iapBase}:setIamPolicy`,
      method: 'POST',
      data: {
        policy: { bindings: iapBindings, etag: iapPolicy.etag },
      },
    })

    return NextResponse.json({ success: true, email })
  } catch (err: unknown) {
    console.log("error");
    console.log(err);
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — remove a user from both roles
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const client = await getAuthClient()
    const member = `user:${email}`

    // 1. Remove from Cloud Run invoker
    const policyRes = await client.request({ url: `${RUN_BASE}:getIamPolicy` })
    const policy = policyRes.data as {
      bindings?: Array<{ role: string; members: string[] }>
      etag?: string
    }

    const bindings = policy.bindings || []
    const invokerBinding = bindings.find((b) => b.role === 'roles/run.invoker')
    if (invokerBinding) {
      invokerBinding.members = invokerBinding.members.filter(
        (m) => m !== member
      )
    }

    await client.request({
      url: `${RUN_BASE}:setIamPolicy`,
      method: 'POST',
      data: {
        policy: { bindings, etag: policy.etag },
      },
    })

    // Fetch Project Number for IAP API
    const rmRes = await client.request({ url: `https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT_ID}` })
    const projectNumber = (rmRes.data as { projectNumber: string }).projectNumber

    // 2. Remove from IAP
    const iapResource = `projects/${projectNumber}/iap_web/cloud_run-${REGION}/services/${SERVICE_NAME}`
    const iapBase = `https://iap.googleapis.com/v1/${iapResource}`

    const iapPolicyRes = await client.request({
      url: `${iapBase}:getIamPolicy`,
      method: 'POST',
      data: { options: { requestedPolicyVersion: 3 } }
    })
    const iapPolicy = iapPolicyRes.data as {
      bindings?: Array<{ role: string; members: string[] }>
      etag?: string
    }

    const iapBindings = iapPolicy.bindings || []
    const iapBinding = iapBindings.find(
      (b) => b.role === 'roles/iap.httpsResourceAccessor'
    )
    if (iapBinding) {
      iapBinding.members = iapBinding.members.filter((m) => m !== member)
    }

    await client.request({
      url: `${iapBase}:setIamPolicy`,
      method: 'POST',
      data: {
        policy: { bindings: iapBindings, etag: iapPolicy.etag },
      },
    })

    return NextResponse.json({ success: true, email })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

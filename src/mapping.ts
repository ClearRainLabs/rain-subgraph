import {
  Contract,
  NewCommunity,
  RoleGranted,
  RoleRevoked,
  MemberAdded,
  MemberRemoved,
  SetCommunityTemplate
} from "../generated/RainCommunity/Contract"
import { Community } from "../generated/schema"
import { ByteArray, log } from '@graphprotocol/graph-ts'
import { processChildCommunity, processUser, initCommunity, filterUserArr
} from './helpers'
import { OWNER_ROLE, ADMIN_ROLE, MODERATOR_ROLE } from './constants'

export function handleNewCommunity(event: NewCommunity): void {
  log.info("HANDLING A NEW COMMUNITY: {}", [event.params.newCommunityAddress.toHex()])
  let parentAddress = event.address
  let parentCommunity = Community.load(parentAddress.toHex())

  if (parentCommunity == null) {
    parentCommunity = initCommunity(parentAddress)
  }

  let childCommunity = processChildCommunity(event, parentCommunity as Community)
  log.info("CHILD COM JUST PROCESSED: {}", [childCommunity.address.toHex()])

  let children = parentCommunity.childCommunities
  children.push(childCommunity.id)
  parentCommunity.childCommunities = children

  parentCommunity.save()
}

export function handleRoleGranted(event: RoleGranted): void {
  log.debug('ROLE GRANTED CALLED: {}', [event.params.role.toHex()])
  let address = event.address
  let community = Community.load(address.toHex())

  if (community == null) {
    community = initCommunity(address)
  }

  let role = event.params.role.toHex()
  let account = processUser(event.params.account)

  if (role == OWNER_ROLE) {
    community.owner = account
  } else if (role == ADMIN_ROLE) {
    let admins = community.admins
    admins.push(account)
    community.admins = admins
  } else if (role == MODERATOR_ROLE) {
    let mods = community.moderators
    mods.push(account)
    community.moderators = mods
  }

  community.save()
}

export function handleRoleRevoked(event: RoleRevoked): void {
  let address = event.address
  let community = Community.load(address.toHex())

  if (community == null) {
    community = initCommunity(address)
  }

  let role = event.params.role.toHex()
  let account = processUser(event.params.account)

  if (role == OWNER_ROLE) {
    community.owner = null
  } else if (role == ADMIN_ROLE) {
    let admins = community.admins
    admins = filterUserArr(admins, account)
    community.admins = admins
  } else if (role == MODERATOR_ROLE) {
    let mods = community.moderators
    mods = filterUserArr(mods, account)
    community.moderators = mods
  }

  community.save()
}

export function handleMemberAdded(event: MemberAdded): void {
  let address = event.address
  let community = Community.load(address.toHex())

  if (community == null) {
    community = initCommunity(address)
  }

  let account = processUser(event.params.account)

  let members = community.members
  members.push(account)
  community.members = members

  community.save()
}

export function handleMemberRemoved(event: MemberRemoved): void {
  let address = event.address
  let community = Community.load(address.toHex())

  if (community == null) {
    community = initCommunity(address)
  }

  let account = processUser(event.params.account)

  let members = community.members
  members = filterUserArr(members as Array<String>, account)
  community.members = members

  community.save()
}

export function handleSetCommunityTemplate(event: SetCommunityTemplate): void {}

import {
  Contract,
  NewCommunity,
  RoleGranted,
  RoleRevoked,
  SetCommunityTemplate
} from "../generated/RainCommunity/Contract"
import { Community, User } from "../generated/schema"
import { Address, crypto, ByteArray, log } from '@graphprotocol/graph-ts'

const OWNER_ROLE = 0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e
const ADMIN_ROLE = 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775
const MODERATOR_ROLE = 0x71f3d55856e4058ed06ee057d79ada615f65cdf5f9ee88181b914225088f834f

export function handleNewCommunity(event: NewCommunity): void {
  log.info("HANDLING A NEW COMMUNITY: {}", [event.params.newCommunityAddress.toHex()])
  let parentAddress = event.address
  let parentCommunity = Community.load(parentAddress.toHex())

  if (parentCommunity == null) {
    parentCommunity = initCommunity(parentAddress)

  }

  let childCommunity = processChildCommunity(event, parentCommunity as Community)

  let children = parentCommunity.childCommunities
  children.push(childCommunity.id)
  parentCommunity.childCommunities = children

  parentCommunity.save()
}

function initCommunity(address: Address): Community {
  let com = new Community(address.toHex())
  let contract = Contract.bind(address)

  com.name = contract.name()
  com.symbol = contract.symbol()
  com.address = address
  com.isOpen = contract.isOpen()

  let ownerAddress = contract.owner() as Address
  let comOwner = processUser(ownerAddress) as User

  return com
}

function processChildCommunity(event: NewCommunity, parent: Community): Community {
  log.info("PROCESSING CHILD COMMUNITY: {}, \nParent Community: {}", [
    event.params.newCommunityAddress.toHex(),
    parent.id
  ])
  let childAddress = event.params.newCommunityAddress.toHex()
  let childContract = Contract.bind(event.params.newCommunityAddress)
  let childCommunity = new Community(childAddress)

  childCommunity.name = childContract.name()
  childCommunity.symbol = childContract.symbol()
  childCommunity.address = event.params.newCommunityAddress
  childCommunity.parentCommunity = parent.id
  childCommunity.childCommunities = []
  childCommunity.isOpen = childContract.isOpen()

  childCommunity.save()
  return childCommunity
}

function processUser(address: Address): User {
  let user = User.load(address.toHex())
  if (user == null) {
    user = new User(address.toHex())
  }
  user.address = address
  user.save()
  return user as User
}

export function handleRoleGranted(event: RoleGranted): void {
  log.info("Role that was granted: {}", [event.params.role.toHex()])
  let string = "OWNER_ROLE"
  let arr = ByteArray.fromHexString(string)
  arr = crypto.keccak256(arr)
  log.info("Our arr of the string: {}", [arr.toHexString()])
}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleSetCommunityTemplate(event: SetCommunityTemplate): void {}

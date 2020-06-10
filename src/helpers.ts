import { Contract, NewCommunity } from "../generated/RainCommunity/Contract"
import { Address, log } from '@graphprotocol/graph-ts'
import { Community, User } from "../generated/schema"

export function processChildCommunity(event: NewCommunity, parent: Community): Community {
  log.info("PROCESSING CHILD COMMUNITY: {}, \nParent Community: {}", [
    event.params.newCommunityAddress.toHex(),
    parent.id
  ])
  let childAddress = event.params.newCommunityAddress
  let childCommunity = initCommunity(childAddress)

  childCommunity.save()
  return childCommunity
}

export function processUser(address: Address): String {
  let user = User.load(address.toHex())
  if (user == null) {
    user = new User(address.toHex())
    user.address = address
    user.save()
  }
  return user.id
}

export function initCommunity(address: Address): Community {
  let com = new Community(address.toHex())
  let contract = Contract.bind(address)

  com.name = contract.name()
  com.symbol = contract.symbol()
  com.address = address
  com.isOpen = contract.isOpen()
  com.members = new Array<String>()
  com.moderators = new Array<String>()
  com.admins = new Array<String>()

  return com
}

// when using array.filter function we got an error 'cannot find name acctId'
// TODO: find out why
export function filterUserArr(arr: Array<String>, acctId: String): Array<String> {
  let updated = new Array<String>(arr.length)

  let i = 0;
  for (i; i < arr.length; i ++) {
    if (arr[i] !== acctId) updated.push(arr[i])
  }

  return updated
}

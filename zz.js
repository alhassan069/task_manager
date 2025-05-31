const currentTime = new Date();
console.log(currentTime.toLocaleString());
console.log(currentTime.toLocaleDateString());
console.log(currentTime.toLocaleTimeString());



{isSearchingUsers ? 'Searching...' : 'No users found'}
</CommandEmpty>
<CommandGroup>
  {assigneeSearchResults.length > 0 && assigneeSearchResults.map(user => (
    <CommandItem
      key={user.id}
      value={user.id.toString()}
      onSelect={() => {
        console.log('Selected user:', user);
        selectAssignee(user.id);
      }}
    >
      <div className="flex flex-col">
        <span>{user.name}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
    </CommandItem>
  ))}
</CommandGroup>
import gql from "graphql-tag";

export const FETCH_NEW_TODOS = gql`
    query ($lastId: Int){
        todos (
            order_by: {
                id: desc
            },
            where: {
                _and: {
                    is_public: { _eq: true},
                    id: { _gt: $lastId}
                }
            }
        ) {
            id
            title
            is_completed
            created_at
            is_public
            user {
                name
            }
        }
    }
`;

export const FETCH_OLD_TODOS = gql`
    query ($lastId: Int, $isPublic: Boolean){
        todos (
            order_by: {
                id: desc
            },
            where: {
                _and: {
                    is_public: { _eq: $isPublic},
                    id: { _lt: $lastId}
                }
            },
            limit: 10
        ) {
            id
            title
            is_completed
            created_at
            is_public
            user {
                name
            }
        }
    }
`;

export const INSERT_TODO = gql`
    mutation ($text: String!, $isPublic: Boolean){
        insert_todos (
            objects: [{
                title: $text,
                is_public: $isPublic
            }]
        ){
            returning {
                id
                title
                is_completed
                created_at
                is_public
                user {
                    name
                }
            }
        }
    }
`;

export const UPDATE_TODO = gql`
    mutation ($id: Int, $isCompleted: Boolean) {
        update_todos (
            _set: {
                is_completed: $isCompleted
            },
            where: {
                id: {
                    _eq: $id
                }
            }
        ) {
            returning {
                id
                title
                is_completed
                created_at
                is_public
            }
        }
    }
`;

export const REMOVE_TODO = gql`
    mutation ($id: Int) {
        delete_todos (
            where: {
                id: {
                    _eq: $id
                }
            }
        ) {
            affected_rows
        }
    }
`;

export const FETCH_TODOS = gql`
    query ($isPublic: Boolean) {
        todos (
            order_by: {
                created_at: desc
            },
            where: { is_public: { _eq: $isPublic} }
            limit: 20
        ) {
            id
            title
            is_completed
            created_at
            is_public
            user {
                name
            }
        }
    }
`;

export const SUBSCRIBE_TO_NEW_TODOS = gql`
    subscription {
        todos (
            order_by: {
                created_at: desc
            }
            limit: 1
            where: { is_public: { _eq: true }}
        ) {
            id
            created_at
        }
    }
`;
